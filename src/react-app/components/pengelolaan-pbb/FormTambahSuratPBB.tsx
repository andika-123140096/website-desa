import React from "react"

interface FormTambahSuratPBBProps {
  suratForm: {
    nomor_objek_pajak: string
    nama_wajib_pajak: string
    alamat_wajib_pajak: string
    alamat_objek_pajak: string
    luas_tanah: string
    luas_bangunan: string
    nilai_jual_objek_pajak: string
    jumlah_pajak_terhutang: string
    tahun_pajak: string
    status_pembayaran: string
    dusun_id: string
  }
  onFormChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  showDusunField?: boolean
  dusunOptions?: { id: number; nama_dusun: string }[]
}

export function FormTambahSuratPBB({ suratForm, onFormChange, onSubmit, onCancel, showDusunField = false, dusunOptions = [] }: FormTambahSuratPBBProps) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Tambah Surat PBB Baru</h6>
        <button className="btn btn-sm btn-secondary" onClick={onCancel}>
          <i className="bi bi-arrow-left me-1"></i>Kembali ke Daftar
        </button>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            {showDusunField && (
              <div className="col-md-6">
                <label className="form-label">
                  Dusun <span className="text-danger">*</span>
                </label>
                <select className="form-select" value={suratForm.dusun_id} onChange={(e) => onFormChange("dusun_id", e.target.value)} required>
                  <option value="">Pilih Dusun</option>
                  {dusunOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama_dusun}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-6">
              <label className="form-label">
                Nomor Objek Pajak <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" value={suratForm.nomor_objek_pajak} onChange={(e) => onFormChange("nomor_objek_pajak", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Tahun Pajak <span className="text-danger">*</span>
              </label>
              <input type="number" className="form-control" value={suratForm.tahun_pajak} onChange={(e) => onFormChange("tahun_pajak", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Nama Wajib Pajak <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" value={suratForm.nama_wajib_pajak} onChange={(e) => onFormChange("nama_wajib_pajak", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Status Pembayaran <span className="text-danger">*</span>
              </label>
              <select className="form-select" value={suratForm.status_pembayaran} onChange={(e) => onFormChange("status_pembayaran", e.target.value)} required>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="bayar_sendiri_di_bank">Bayar Sendiri di Bank</option>
                <option value="bayar_lewat_perangkat_desa">Bayar Lewat Perangkat Desa</option>
                <option value="pindah_rumah">Pindah Rumah</option>
                <option value="tidak_diketahui">Tidak Diketahui</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">
                Alamat Wajib Pajak <span className="text-danger">*</span>
              </label>
              <textarea className="form-control" rows={2} value={suratForm.alamat_wajib_pajak} onChange={(e) => onFormChange("alamat_wajib_pajak", e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label">
                Alamat Objek Pajak <span className="text-danger">*</span>
              </label>
              <textarea className="form-control" rows={2} value={suratForm.alamat_objek_pajak} onChange={(e) => onFormChange("alamat_objek_pajak", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Luas Tanah (m²) <span className="text-danger">*</span>
              </label>
              <input type="number" className="form-control" value={suratForm.luas_tanah} onChange={(e) => onFormChange("luas_tanah", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Luas Bangunan (m²) <span className="text-danger">*</span>
              </label>
              <input type="number" className="form-control" value={suratForm.luas_bangunan} onChange={(e) => onFormChange("luas_bangunan", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Nilai Jual Objek Pajak <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={suratForm.nilai_jual_objek_pajak}
                onChange={(e) => onFormChange("nilai_jual_objek_pajak", e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Jumlah Pajak Terhutang <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={suratForm.jumlah_pajak_terhutang}
                onChange={(e) => onFormChange("jumlah_pajak_terhutang", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-save me-1"></i>Simpan
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
