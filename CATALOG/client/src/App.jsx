import React from 'react'
import ProductList from './components/ProductList'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Saree Catalog</h1>
        <p>Discover our beautiful collection of sarees</p>
      </header>
      <main className="app-main">
        <ProductList />
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 Saree Catalog. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
