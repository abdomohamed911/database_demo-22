@echo off
echo Setting up Field Training Management Database...

REM Run the DDL script to create database and tables
mysql -u root -p < field_training_ddl.sql

REM Run the DML script to insert sample data
mysql -u root -p FieldTrainingManagement < field_training_dml.sql

REM Run the phase5 script to create views and stored procedures
mysql -u root -p FieldTrainingManagement < phase5_Sql_Script.sql

echo Database setup complete! 