# --- Étape 1 : build de l'application React ---
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_EVENTS_API_URL=http://localhost:3001
ARG VITE_PARTICIPANTS_API_URL=http://localhost:3002
ARG VITE_REGISTRATIONS_API_URL=http://localhost:3003

ENV VITE_EVENTS_API_URL=$VITE_EVENTS_API_URL
ENV VITE_PARTICIPANTS_API_URL=$VITE_PARTICIPANTS_API_URL
ENV VITE_REGISTRATIONS_API_URL=$VITE_REGISTRATIONS_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Étape 2 : servir les fichiers statiques avec nginx ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
