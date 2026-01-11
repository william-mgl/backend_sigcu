# backend/Dockerfile

# 1. Imagen base
FROM node:22-alpine

# 2. Carpeta de trabajo
WORKDIR /app

# 3. Copiar dependencias
COPY package*.json ./

# 4. CAMBIO CLAVE: Usamos 'install' normal para tener nodemon y herramientas dev
RUN npm install

# 5. Copiar código
COPY . .

# 6. Puerto
EXPOSE 4000

# 7. CAMBIO CLAVE: Usamos 'dev' para ver cambios en vivo
CMD ["npm", "run", "dev"]