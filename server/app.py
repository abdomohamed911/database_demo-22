import os
from flask import Flask, request, jsonify, session, make_response
from flask_cors import CORS
import mysql.connector
import pandas as pd
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import io # Import io module for in-memory file operations
from functools import wraps # Import wraps for decorators

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3005"]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
app.secret_key = os.getenv('FLASK_SECRET_KEY')

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Ensure the uploads folder exists
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}

# Database connection function
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_NAME'),
            port=3306
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Middleware for authentication/authorization ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'ssn' not in session:
            return jsonify({"message": "Unauthorized: Login required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session or session['role'] not in roles:
                return jsonify({"message": "Forbidden: Insufficient permissions"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# --- API Routes ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    ssn = data.get('ssn')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor()
    role = None

    try:
        # Check if Admin
        cursor.execute("SELECT ssn FROM Admin WHERE ssn = %s", (ssn,))
        if cursor.fetchone():
            role = 'Admin'
        
        # Check if Student
        if not role:
            cursor.execute("SELECT ssn FROM Student WHERE ssn = %s", (ssn,))
            if cursor.fetchone():
                role = 'Student'

        # Check if InternshipCoordinator
        if not role:
            cursor.execute("SELECT ssn FROM InternshipCoordinator WHERE ssn = %s", (ssn,))
            if cursor.fetchone():
                role = 'InternshipCoordinator'

        # Check if Mentor
        if not role:
            cursor.execute("SELECT ssn FROM Mentor WHERE ssn = %s", (ssn,))
            if cursor.fetchone():
                role = 'Mentor'
        
    except mysql.connector.Error as err:
        return jsonify({"message": f"Database error during login: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

    if role:
        session['ssn'] = ssn
        session['role'] = role
        return jsonify({"message": "Login successful", "ssn": ssn, "role": role}), 200
    else:
        return jsonify({"message": "Invalid SSN or role not recognized"}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    session.pop('ssn', None)
    session.pop('role', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    if 'ssn' in session and 'role' in session:
        return jsonify({"isAuthenticated": True, "ssn": session['ssn'], "role": session['role']}), 200
    return jsonify({"isAuthenticated": False}), 200

# --- User-specific dashboards/data ---
@app.route('/api/admin_dashboard_data', methods=['GET'])
@login_required
@role_required(['Admin'])
def admin_dashboard_data():
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM AdminView")
        data = cursor.fetchall()
        return jsonify(data), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error fetching admin data: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/student_dashboard_data', methods=['GET'])
@login_required
@role_required(['Student'])
def student_dashboard_data():
    ssn = session['ssn']
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT s.ssn, u.name as full_name, u.email, e.final_grade as grade,
                   i.company_name, m.position as mentor_position, m.type as mentor_type
            FROM Student s
            JOIN User u ON s.ssn = u.ssn
            LEFT JOIN Internship i ON s.ssn = i.s_id
            LEFT JOIN Mentor m ON s.m_id = m.m_id
            LEFT JOIN Evaluation e ON s.ssn = e.s_id
            WHERE s.ssn = %s
        """, (ssn,))
        data = cursor.fetchall()
        return jsonify(data), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error fetching student data: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/coordinator_dashboard_data', methods=['GET'])
@login_required
@role_required(['InternshipCoordinator'])
def coordinator_dashboard_data():
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM CoordinatorView")
        data = cursor.fetchall()
        return jsonify(data), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error fetching coordinator data: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/mentor_dashboard_data', methods=['GET'])
@login_required
@role_required(['Mentor'])
def mentor_dashboard_data():
    ssn = session['ssn']
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        # First get mentor's own information
        cursor.execute("""
            SELECT m.type as mentor_type, m.position, m.company_name as mentor_company
            FROM Mentor m
            WHERE m.ssn = %s
        """, (ssn,))
        mentor_info = cursor.fetchone() or {}

        # Then get assigned students information
        cursor.execute("""
            SELECT s.ssn, u.name as student_name, u.email as student_email,
                   i.company_name, i.start_date, i.end_date,
                   e.final_grade, e.comments
            FROM Mentor m
            JOIN Student s ON m.ssn = s.m_id
            JOIN User u ON s.ssn = u.ssn
            LEFT JOIN Internship i ON s.ssn = i.s_id
            LEFT JOIN Evaluation e ON s.ssn = e.s_id
            WHERE m.ssn = %s
        """, (ssn,))
        students_data = cursor.fetchall()

        # Combine the data
        response_data = {
            'mentor_info': mentor_info,
            'students': students_data
        }
        
        return jsonify(response_data), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error fetching mentor data: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

# --- General Data Fetch (for Admin or specific cases) ---
@app.route('/api/users', methods=['GET'])
@login_required
@role_required(['Admin'])
def get_users():
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT ssn, name, email, address, date_of_birth FROM User")
        users = cursor.fetchall()
        return jsonify(users), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error fetching users: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

# --- Data Insertion API ---
@app.route('/api/add_user', methods=['POST'])
@login_required
@role_required(['Admin'])
def add_user():
    data = request.get_json()
    ssn = data.get('ssn')
    name = data.get('name')
    email = data.get('email')
    address = data.get('address')
    date_of_birth = data.get('date_of_birth')

    if not all([ssn, name, email, date_of_birth]):
        return jsonify({"message": "SSN, Name, Email, and Date of Birth are required."}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO User (ssn, name, email, address, date_of_birth) VALUES (%s, %s, %s, %s, %s)",
            (ssn, name, email, address, date_of_birth)
        )
        conn.commit()
        return jsonify({"message": "User added successfully!"}), 201
    except mysql.connector.IntegrityError as err:
        conn.rollback()
        return jsonify({"message": f"Error: User with SSN '{ssn}' already exists or invalid data. {err}"}), 409
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"message": f"Database error adding user: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

# --- Business Queries API ---
@app.route('/api/business_queries', methods=['GET'])
@login_required
@role_required(['Admin'])
def get_business_queries():
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor(dictionary=True)
    results = {}

    try:
        # 1. Internship with highest grade
        cursor.execute("""
            SELECT i.company_name, MAX(e.final_grade) AS highest_grade
            FROM Evaluation e JOIN Internship i ON e.s_id = i.s_id
            GROUP BY i.company_name ORDER BY highest_grade DESC LIMIT 1;
        """)
        results['highest_grade_internship'] = cursor.fetchone()

        # 2. Most selected mentor by high-score students
        cursor.execute("""
            SELECT m.position, COUNT(*) AS count
            FROM Mentor m JOIN Student s ON m.m_id = s.m_id JOIN Evaluation e ON s.student_id = e.s_id
            WHERE e.final_grade IN ('A', 'A+') GROUP BY m.position ORDER BY count DESC;
        """)
        results['most_selected_mentor'] = cursor.fetchall()

        # 3. Number of students per internship coordinator
        cursor.execute("""
            SELECT ic.name AS coordinator_name, COUNT(DISTINCT s.student_id) AS total_students
            FROM InternshipCoordinator ic JOIN Internship i ON ic.ic_id = i.ic_id JOIN Student s ON i.s_id = s.student_id
            GROUP BY ic.name;
        """)
        results['students_per_coordinator'] = cursor.fetchall()

        # 4. External evaluations and internal mentor guidance
        cursor.execute("""
            SELECT s.student_id, e.comments AS evaluation, m.position AS mentor_position
            FROM Student s JOIN Evaluation e ON s.student_id = e.s_id JOIN Mentor m ON s.m_id = m.m_id;
        """)
        results['evaluations_mentor_guidance'] = cursor.fetchall()

        # 5. Internship duration and reports per company
        cursor.execute("""
            SELECT i.company_name, DATEDIFF(i.end_date, i.start_date) AS duration, COUNT(e.final_grade) AS reports
            FROM Internship i JOIN Evaluation e ON i.s_id = e.s_id GROUP BY i.company_name;
        """)
        results['internship_duration_reports'] = cursor.fetchall()

        # 6. Students with low grades to be warned
        cursor.execute("""
            SELECT s.student_id, u.name, e.final_grade
            FROM Student s JOIN Evaluation e ON s.student_id = e.s_id JOIN User u ON s.ssn = u.ssn
            WHERE e.final_grade IN ('D', 'F');
        """)
        results['low_grade_students'] = cursor.fetchall()

        return jsonify(results), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error running business queries: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

# --- Report Export API ---
@app.route('/api/export_report/<string:report_name>', methods=['GET'])
@login_required
@role_required(['Admin'])
def export_report(report_name):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor(dictionary=True)
    data = []

    try:
        if report_name == 'low_grade_students':
            cursor.execute("""
                SELECT s.student_id, u.name, e.final_grade
                FROM Student s JOIN Evaluation e ON s.student_id = e.s_id JOIN User u ON s.ssn = u.ssn
                WHERE e.final_grade IN ('D', 'F');
            """)
            data = cursor.fetchall()
        else:
            return jsonify({"message": "Invalid report name for export"}), 400

        if data:
            df = pd.DataFrame(data)
            # Use BytesIO to create an in-memory file for sending
            csv_buffer = io.BytesIO()
            df.to_csv(csv_buffer, index=False, encoding='utf-8')
            csv_buffer.seek(0)
            
            # Flask's send_file can directly return a file-like object
            response = make_response(csv_buffer.getvalue())
            response.headers["Content-Disposition"] = f"attachment; filename={report_name}.csv"
            response.headers["Content-type"] = "text/csv"
            return response
        else:
            return jsonify({"message": f"No data to export for {report_name}."}), 404

    except mysql.connector.Error as err:
        return jsonify({"message": f"Database error exporting report: {err}"}), 500
    except Exception as e:
        return jsonify({"message": f"Error exporting report: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# --- File Upload API ---
@app.route('/api/upload_data', methods=['POST'])
@login_required
@role_required(['Admin'])
def upload_data():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(filepath)
            expected_columns = {'ssn', 'name', 'email', 'address', 'date_of_birth'} # For User table

            try:
                if filename.endswith('.csv'):
                    df = pd.read_csv(filepath)
                elif filename.endswith('.xlsx'):
                    df = pd.read_excel(filepath)
                else:
                    # This case should ideally not be reached if allowed_file is comprehensive
                    return jsonify({"message": "Unsupported file type. Only CSV or XLSX allowed."}), 400
            except pd.errors.EmptyDataError:
                return jsonify({"message": "File is empty."}), 400
            except pd.errors.ParserError:
                return jsonify({"message": "Could not parse CSV file. Please ensure it is correctly formatted."}), 400
            except Exception as e: # Catch other pandas related errors during read
                return jsonify({"message": f"Error reading file: {e}. Ensure it is a valid CSV or XLSX file."}), 400

            # Validate columns for User table upload
            if not expected_columns.issubset(df.columns):
                missing = expected_columns - set(df.columns)
                extra = set(df.columns) - expected_columns
                error_message = "Uploaded file columns do not match expected 'User' table structure. "
                if missing:
                    error_message += f"Missing columns: {', '.join(sorted(list(missing)))}. "
                if extra:
                    error_message += f"Unexpected columns: {', '.join(sorted(list(extra)))}. "
                error_message += "Please ensure the file has exactly these headers: ssn, name, email, address, date_of_birth."
                return jsonify({"message": error_message}), 400

            conn = get_db_connection()
            if not conn: return jsonify({"message": "Database connection error"}), 500
            
            cursor = conn.cursor()
            rows_processed = 0
            
            # --- IMPORTANT: This logic is currently specific to the 'User' table. ---
            # For other tables, a more generic approach or different endpoints would be needed.
            try:
                for index, row in df.iterrows():
                    # Check for presence of all expected columns for safety, though covered by above check
                    if not all(col in row for col in expected_columns):
                         # This individual row check might be redundant if df.columns check is robust
                        conn.rollback() # Rollback any partial commits if processing row by row transactionally
                        return jsonify({"message": f"Row {index + 2} is missing required data. All columns (ssn, name, email, address, date_of_birth) must have values."}), 400

                    sql = """
                        INSERT INTO User (ssn, name, email, address, date_of_birth)
                        VALUES (%s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), address=VALUES(address), date_of_birth=VALUES(date_of_birth)
                    """
                    cursor.execute(sql, (
                        row['ssn'], # Changed from row.get('ssn') to direct access after column validation
                        row['name'],
                        row['email'],
                        row['address'],
                        row['date_of_birth']
                    ))
                    rows_processed += 1
                conn.commit()
                return jsonify({"message": f"File uploaded and {rows_processed} rows processed successfully for 'User' table!"}), 200
            except KeyError as e: # Should be largely caught by the column check above
                conn.rollback()
                return jsonify({"message": f"Error accessing data: Missing column {e} in a row. This should have been caught by initial column validation."}), 400
            except mysql.connector.Error as e:
                conn.rollback()
                error_code = e.errno
                if error_code == 1062: # Duplicate entry
                    return jsonify({"message": f"Database error: Duplicate entry found. {e}"}), 409
                return jsonify({"message": f"Database error processing row: {e}. Data rolled back."}), 500
            finally: # Inner finally for connection closing if opened
                if 'cursor' in locals() and cursor:
                    cursor.close()
                if 'conn' in locals() and conn and conn.is_connected():
                    conn.close()

        except Exception as e: # Outer try-except for file saving or initial pandas errors
            # Log this error for server-side diagnostics
            app.logger.error(f"Unhandled error in file upload: {e}")
            return jsonify({"message": f"An unexpected error occurred during file processing: {e}"}), 500
        finally: # Outer finally for file path cleanup
            if os.path.exists(filepath):
                os.remove(filepath) # Clean up temp file
            if 'conn' in locals() and conn.is_connected():
                cursor.close()
                conn.close()
    else:
        return jsonify({"message": "Allowed file types are CSV, XLSX"}), 400

# --- Stored Procedure API ---
@app.route('/api/failing_students_count', methods=['GET'])
@login_required
@role_required(['Admin'])
def get_failing_students_count():
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor()
    fail_count = 0
    try:
        cursor.callproc('CountFailingStudents', (0,))
        for result in cursor.stored_results():
            fail_count = result.fetchone()[0]
        return jsonify({"failing_students_count": fail_count}), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error calling stored procedure: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/apply_internship', methods=['POST'])
@login_required
@role_required(['Student'])
def apply_internship():
    data = request.get_json()
    student_id = session['ssn']  # Get the logged-in student's SSN
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor()
    try:
        # Check if student already has an internship
        cursor.execute("SELECT * FROM Internship WHERE s_id = %s", (student_id,))
        if cursor.fetchone():
            return jsonify({"message": "Student already has an internship assigned"}), 400

        # Insert new internship application
        cursor.execute("""
            INSERT INTO Internship (s_id, company_name, start_date, end_date, m_id, c_id, e_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            student_id,
            data['company_name'],
            data['start_date'],
            data['end_date'],
            data['mentor_id'] or None,
            data['coordinator_id'],
            data['evaluator_id']
        ))
        
        conn.commit()
        return jsonify({"message": "Internship application submitted successfully"}), 201
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"message": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/submit_evaluation', methods=['POST'])
@login_required
@role_required(['InternshipEvaluator'])
def submit_evaluation():
    data = request.get_json()
    evaluator_id = session['ssn']  # Get the logged-in evaluator's SSN
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection error"}), 500

    cursor = conn.cursor()
    try:
        # Check if student exists and has an internship
        cursor.execute("""
            SELECT * FROM Student s
            JOIN Internship i ON s.ssn = i.s_id
            WHERE s.ssn = %s
        """, (data['student_id'],))
        
        if not cursor.fetchone():
            return jsonify({"message": "Student not found or no internship assigned"}), 404

        # Check if evaluation already exists
        cursor.execute("SELECT * FROM Evaluation WHERE s_id = %s", (data['student_id'],))
        if cursor.fetchone():
            # Update existing evaluation
            cursor.execute("""
                UPDATE Evaluation
                SET final_grade = %s,
                    comments = %s,
                    performance_score = %s,
                    e_id = %s,
                    c_id = %s
                WHERE s_id = %s
            """, (
                data['final_grade'],
                data['comments'],
                data['performance_score'],
                evaluator_id,
                data['coordinator_id'],
                data['student_id']
            ))
        else:
            # Insert new evaluation
            cursor.execute("""
                INSERT INTO Evaluation (s_id, final_grade, comments, performance_score, e_id, c_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                data['student_id'],
                data['final_grade'],
                data['comments'],
                data['performance_score'],
                evaluator_id,
                data['coordinator_id']
            ))
        
        conn.commit()
        return jsonify({"message": "Evaluation submitted successfully"}), 201
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"message": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    # Use FLASK_PORT environment variable for port, default to 5000
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(debug=True, port=port)