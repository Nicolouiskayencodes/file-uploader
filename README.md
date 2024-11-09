**Passport template**
Template for authenticating users 
npm install express pg express-session passport passport-local bcryptjs dotenv connect-pg-simple
Add a .env with variables SECRET and DATABASE_URL


--to create session table
psql mydatabase < node_modules/connect-pg-simple/table.sql 