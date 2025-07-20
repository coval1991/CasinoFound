# Dockerfile para o Frontend CasinoFound
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY frontend/casinofound-frontend/package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY frontend/casinofound-frontend/ .

# Build da aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]

