import React from "react"
import { Link } from "react-router-dom"

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "#f4f6f9",
        color: "#343a40",
        padding: "4rem 2rem",
        textAlign: "center",
        marginTop: "auto",
        fontFamily: "Arial, sans-serif",
        borderTop: "1px solid #dee2e6",
        minHeight: "120px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            fontSize: "1rem",
            fontWeight: "400",
            lineHeight: "1.5",
          }}
        >
          Made by{" "}
          <Link
            to="/credits"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "500",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0056b3")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#007bff")}
          >
            Kelompok 6 Kapita Selekta Informatika
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
