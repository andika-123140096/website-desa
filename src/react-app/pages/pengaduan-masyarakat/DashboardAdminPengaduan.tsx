import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Aduan } from "../../types"
import { StatsCards, FilterSection } from "../../components/pengaduan-masyarakat/DashboardAdmin"
import { DashboardHeader } from "../../components/pengaduan-masyarakat/DashboardHeader"
import { AduanDetail } from "../../components/pengaduan-masyarakat/AduanDetail"
import { AduanTable } from "../../components/pengaduan-masyarakat/AduanTable"

export function DashboardAdminPengaduan() {
  const { apiRequest } = useAuth()
  const [aduan, setAduan] = useState<Aduan[]>([])
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null)
  const [tanggapan, setTanggapan] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"daftar" | "detail">("daftar")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100

  const fetchAduan = useCallback(async () => {
    try {
      setLoading(true)
      const url = statusFilter ? `/api/aduan?status=${statusFilter}` : "/api/aduan"
      const result = await apiRequest<Aduan[]>(url)
      setAduan(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, apiRequest])

  useEffect(() => {
    fetchAduan()
  }, [fetchAduan])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const fetchDetail = async (id: string) => {
    try {
      const result = await apiRequest<Aduan>(`/api/aduan/${id}`)
      setSelectedAduan(result)
      setTanggapan("")
      setActiveTab("detail")
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/api/aduan/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      })
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Status berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
      })
      fetchAduan()
      if (selectedAduan?.id === id) {
        fetchDetail(id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const submitTanggapan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAduan) return

    try {
      await apiRequest(`/api/aduan/${selectedAduan.id}/tanggapan`, {
        method: "POST",
        body: JSON.stringify({ isi_tanggapan: tanggapan }),
      })
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Tanggapan berhasil dikirim",
        timer: 2000,
        showConfirmButton: false,
      })
      setTanggapan("")
      fetchDetail(selectedAduan.id)
      fetchAduan()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredAduan = aduan.filter(
    (item) =>
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi_aduan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container-wide">
      <DashboardHeader role="admin" activeTab={activeTab} onBackToList={() => setActiveTab("daftar")} />

      {activeTab === "daftar" && (
        <>
          <StatsCards aduan={aduan} />

          <FilterSection statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} onRefresh={fetchAduan} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <AduanTable
            aduan={filteredAduan}
            loading={loading}
            onViewDetail={fetchDetail}
            role="admin"
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAduan.length}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {activeTab === "detail" && selectedAduan && (
        <AduanDetail aduan={selectedAduan} isAdmin={true} tanggapan={tanggapan} setTanggapan={setTanggapan} onStatusChange={updateStatus} onSubmitTanggapan={submitTanggapan} />
      )}
    </div>
  )
}
