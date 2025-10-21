import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { SuratPBB } from "../../types"
import { formatStatusPembayaran, getStatusPembayaranColor } from "../../utils/formatters"

export function DetailSuratPBB() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [surat, setSurat] = useState<SuratPBB | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuratDetail = async () => {
      if (!id || !token) return

      try {
        const response = await fetch(`/api/surat-pbb/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setSurat(data)
        } else {
          setError("Surat PBB tidak ditemukan")
        }
      } catch (err) {
        console.error("Error fetching surat detail:", err)
        setError("Terjadi kesalahan saat memuat data")
      } finally {
        setLoading(false)
      }
    }

    fetchSuratDetail()
  }, [id, token])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !surat) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error || "Data tidak ditemukan"}
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Detail Surat PBB</h2>
          <p className="text-muted mb-0">
            <i className="bi bi-file-text me-2"></i>
            NOP: {surat.nomor_objek_pajak}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i>Kembali
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Nomor Objek Pajak (NOP)</label>
              <div className="fw-semibold font-monospace">{surat.nomor_objek_pajak}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Tahun Pajak</label>
              <div className="fw-semibold">{surat.tahun_pajak}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Nama Wajib Pajak</label>
              <div className="fw-semibold">{surat.nama_wajib_pajak}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Status Pembayaran</label>
              <div>
                <span className={`badge bg-${getStatusPembayaranColor(surat.status_pembayaran)}`}>{formatStatusPembayaran(surat.status_pembayaran)}</span>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label text-muted small mb-1">Alamat Wajib Pajak</label>
              <div className="fw-semibold">{surat.alamat_wajib_pajak || "-"}</div>
            </div>
            <div className="col-12">
              <label className="form-label text-muted small mb-1">Alamat Objek Pajak</label>
              <div className="fw-semibold">{surat.alamat_objek_pajak}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Luas Tanah</label>
              <div className="fw-semibold">{surat.luas_tanah ? `${surat.luas_tanah} m²` : "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Luas Bangunan</label>
              <div className="fw-semibold">{surat.luas_bangunan ? `${surat.luas_bangunan} m²` : "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Nilai Jual Objek Pajak (NJOP)</label>
              <div className="fw-semibold">{surat.nilai_jual_objek_pajak ? `Rp ${Number(surat.nilai_jual_objek_pajak).toLocaleString("id-ID")}` : "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Jumlah Pajak Terhutang</label>
              <div className="fw-semibold text-primary">Rp {Number(surat.jumlah_pajak_terhutang).toLocaleString("id-ID")}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Dusun</label>
              <div className="fw-semibold">{surat.nama_dusun || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Perangkat Desa</label>
              <div className="fw-semibold">{surat.nama_perangkat || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Waktu Dibuat</label>
              <div className="small">{new Date(surat.waktu_dibuat).toLocaleString("id-ID")}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small mb-1">Waktu Diperbarui</label>
              <div className="small">{new Date(surat.waktu_diperbarui).toLocaleString("id-ID")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
