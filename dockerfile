# 第一階段：建立階段
FROM node:18-alpine AS builder
WORKDIR /app

# 複製 package.json 和 lock 檔（如果有的話），安裝相依套件
COPY package*.json ./
RUN npm install

# 複製所有原始碼到容器中
COPY . .

# 執行建置指令（通常會同時執行 TailwindCSS 的打包）
RUN npm run build

# 第二階段：生產環境
FROM nginx:alpine

# 複製自定義的 Nginx 設定檔到容器中（覆蓋預設的設定）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 將 React 建置後的靜態檔案複製到 Nginx 預設服務目錄中
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
