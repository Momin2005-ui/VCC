npx prisma db push   =  pusht the models to db

npx prisma generate   = create prisma client


ADMIN details:

  Email - admin@iiitdwd.ac.in
  Password - test4password


if google Oauth has to work in your local folder , you have to create google client id  but first try without creating it 
but make sure backend runs at port 3000 and frontend in port 3001


Admin cannot register , so only registered admins can login using Oauth 
whoever registers their account is considered as USER



How to run this application locally:

    1. create .env files in both backend and frontend folder ..... in fontend create the .env file as .env.local and in backend normal .env
       BACKEND FOLDER's .env:
                  DATABASE_URL=mongodb+srv://Momin:GmxMrHklTigoIyVu@groupproject.2ac8bsl.mongodb.net/mydb?retryWrites=true&w=majority
                  PORT=3000
                  BACKENDURL=http://localhost:3000
                  MailService=msdoo9233@gmail.com
                  MailPassword=awer cqat ulsx cutp
                  MailPort=587
                  JWTSECRETKEY="your secret key preetham is great"
                  FRONTENDURL=http://localhost:3001
                  GOOGLECLIENTID =1011757238042-f866dokep98e8vtuvemog9mf0rcaml0j.apps.googleusercontent.com

       FRONTEND FOLDER's .env:
                   NEXT_PUBLIC_API_URL=http://localhost:3000   ///  API_URL is nothing but backend URL
                   NEXT_PUBLIC_GOOGLE_CLIENT_ID=1011757238042-f866dokep98e8vtuvemog9mf0rcaml0j.apps.googleusercontent.com

      2. Go inside each folder and run npm ci or npm i (both backend and frontend)

      2. after adding all these go inside each folder for example if you are in root folder cd backend use to go inside backend folder and run npm run dev and do same in frontend , go inside frontend folder and do npm run dev

                  



