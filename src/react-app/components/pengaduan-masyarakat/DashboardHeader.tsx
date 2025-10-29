import { useAuth } from "../../contexts/AuthContext"

interface DashboardHeaderProps {
  role: "admin" | "masyarakat"
  activeTab: "daftar" | "detail" | "buat"
  onBackToList?: () => void
  setActiveTab?: (tab: "daftar" | "detail" | "buat") => void
}

export function DashboardHeader({ role, activeTab, onBackToList, setActiveTab }: DashboardHeaderProps) {
  const { user } = useAuth()

  const title = role === "admin" ? "Dashboard Admin Pengaduan" : "Dashboard Pengaduan Masyarakat"
  const description = role === "admin" ? "Kelola semua aduan masyarakat" : `Selamat datang, ${user?.nama_lengkap || "User"}`

  return (
    <div className="dashboard-header">
      <div>
        <h2>{title}</h2>
        <p className="text-muted mb-0">{description}</p>
      </div>
      <div className="d-flex gap-2">
        {(activeTab === "buat" || activeTab === "detail") && setActiveTab && (
          <button className="btn btn-outline-primary" onClick={() => setActiveTab("daftar")}>
            <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar
          </button>
        )}
        {activeTab === "detail" && !setActiveTab && onBackToList && (
          <button className="btn btn-outline-primary" onClick={onBackToList}>
            <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar
          </button>
        )}
        {role === "masyarakat" && activeTab === "daftar" && setActiveTab && (
          <button className="btn btn-primary" onClick={() => setActiveTab("buat")}>
            <i className="bi bi-plus-circle me-2"></i>Buat Aduan Baru
          </button>
        )}
      </div>
    </div>
  )
}
