Simple CSV conversion tool


Build Commands:

npm run build

npm run preview

sudo docker build . -t buxtonlimecoverter

sudo docker run -p 8080:8080 buxtonlimecoverter:latest

sudo docker tag buxtonlimecoverter:latest andyuks/buxtonlimecoverter:latest

sudo docker push andyuks/buxtonlimecoverter:latest


sudo docker run -it --rm -d -p 8088:8080 --name buxtonlimecoverter andyuks/buxtonlimecoverter
