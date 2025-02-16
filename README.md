# 🌾 **Farm2You**  

**Farm2You** is a local produce marketplace that connects farmers and consumers, promoting fresh, locally sourced food while reducing waste. The platform enables farmers to list their products and provides real-time insights to optimize their operations.

## 🚀 **Features**  

### 🛍️ **For Customers**  
- Browse and purchase fresh, locally grown produce.  
- Pre-order items for pickup or delivery.  
- Explore an **Imperfect Produce Section** for budget-friendly, sustainable choices.  

### 👨‍🌾 **For Farmers**  
- List products with images, descriptions, and prices.  
- Get **real-time weather insights** and **crop suggestions** powered by OpenWeatherMap and a **custom AI assistant** trained with USDA data.  
- Manage inventory, track orders, and view analytics via a **farmer dashboard**.  

### 🔄 **Other Key Features**  
- **Real-time updates** using Firebase.  
- **Secure authentication** for both farmers and customers.  
- **Sustainability tracker** to measure food waste reduction.  

## 🛠️ **How We Built It**  
- **Frontend:** React Native (for cross-platform mobile support).  
- **Backend & Database:** Firebase (for real-time updates, authentication, and data management).  
- **Weather & AI Insights:** OpenWeatherMap API + GPT-4o Mini (enhanced with USDA knowledge for better crop recommendations).  

## 📂 **Project Structure**  
```
Farm2You/
│── app/
│   ├── cart.tsx
│   ├── _layout.tsx
│   ├── +not-found.tsx
│   ├── CartContext.tsx
│   ├── checkout.tsx
│   ├── explore.tsx
│   ├── farmer.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── marketplace.tsx
│   ├── signup.tsx
│   ├── user.tsx
│   ├── weather.tsx
│── assets/
│── components/
│── constants/
│── Farmers/
│── hooks/
│── scripts/
│── .env
│── .gitignore
│── App.js
├── fast_api.py
├── knowledge-database.json
```

## 🏗️ **Getting Started**  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-username/Farm2You.git
cd Farm2You
```

### 2️⃣ Install Dependencies  
```bash
npm install
```

### 3️⃣ Set Up Firebase  
- Create a **Firebase** project.  
- Enable **Authentication** and **Firestore Database**.  
- Add your Firebase config in `.env`.  

### 4️⃣ Start the App  
```bash
npm start
```

## 📌 **Future Enhancements**  
- Expand the **sustainability tracker** with more detailed insights.  
- Implement **AI-powered personalized crop recommendations** for farmers.  
- Introduce **subscription-based produce deliveries** for customers.  

---
## 📌 **Contributors**  
Katha Mehta 
Akriti Saxena
Nishi Mewada
Deepiga Sengottuvelu Ravichandran
