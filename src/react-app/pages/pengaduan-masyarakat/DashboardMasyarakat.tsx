import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Aduan } from '../../types';

export function DashboardMasyarakat() {
  const { token, user, logout } = useAuth();
  const [aduan, setAduan] = useState<Aduan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null);
  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Infrastruktur',
    isi_aduan: '',
  });

  const fetchAduan = useCallback(async () => {
    try {
      const res = await fetch('/api/aduan/saya', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAduan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAduan(); }, [fetchAduan]);

  const fetchDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/aduan/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setSelectedAduan(result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/aduan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          judul: formData.judul,
          isi: formData.isi_aduan,
          kategori: formData.kategori
        }),
      });
      if (res.ok) {
        alert('Aduan berhasil dibuat');
        setShowModal(false);
        setFormData({ judul: '', kategori: 'Infrastruktur', isi_aduan: '' });
        fetchAduan();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal membuat aduan');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'selesai': return 'success';
      case 'proses': return 'warning';
      default: return 'secondary';
    }
  };

  const kategoriBadgeColor = (kategori: string) => {
    switch (kategori) {
      case 'Infrastruktur': return 'primary';
      case 'Lingkungan': return 'success';
      case 'Pelayanan': return 'info';
      case 'Keamanan': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="container-wide">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Pengaduan Masyarakat</h2>
          <p className="text-muted mb-0">Selamat datang, <strong>{user?.nama_lengkap || 'User'}</strong></p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>Buat Aduan Baru
          </button>
          <button className="btn btn-outline-danger" onClick={logout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : aduan.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <h4 className="mt-3">Belum Ada Aduan</h4>
            <p className="text-muted">Klik tombol "Buat Aduan Baru" untuk membuat aduan pertama Anda</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ minWidth: '50px' }}>No</th>
                <th style={{ minWidth: '250px' }}>Judul Aduan</th>
                <th style={{ minWidth: '150px' }}>Kategori</th>
                <th style={{ minWidth: '120px' }}>Status</th>
                <th style={{ minWidth: '150px' }}>Tanggal Dibuat</th>
                <th style={{ minWidth: '150px' }}>Tanggal Update</th>
                <th style={{ minWidth: '150px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {aduan.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{item.judul}</strong>
                  </td>
                  <td>
                    <span className={`badge bg-${kategoriBadgeColor(item.kategori)}`}>
                      {item.kategori}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${statusBadgeColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(item.created_at || item.waktu_dibuat).toLocaleDateString('id-ID')}</td>
                  <td>{new Date(item.updated_at || item.waktu_diperbarui).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => fetchDetail(item.id)}
                      >
                        <i className="bi bi-eye me-1"></i>Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Buat Aduan Baru</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Judul Aduan *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      placeholder="Masukkan judul aduan"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Kategori *</label>
                    <select
                      className="form-select"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    >
                      <option>Infrastruktur</option>
                      <option>Lingkungan</option>
                      <option>Pelayanan</option>
                      <option>Keamanan</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Isi Aduan *</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={formData.isi_aduan}
                      onChange={(e) => setFormData({ ...formData, isi_aduan: e.target.value })}
                      placeholder="Jelaskan aduan Anda secara detail..."
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-send me-2"></i>Kirim Aduan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedAduan && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-file-text me-2"></i>
                  Detail Aduan
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedAduan(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="p-4 border-bottom bg-light">
                  <h4 className="mb-3">{selectedAduan.judul}</h4>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-tag-fill text-primary me-2 mt-1"></i>
                        <div>
                          <small className="text-muted d-block">Kategori</small>
                          <span className={`badge bg-${kategoriBadgeColor(selectedAduan.kategori)}`}>
                            {selectedAduan.kategori}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-info-circle-fill text-primary me-2 mt-1"></i>
                        <div>
                          <small className="text-muted d-block">Status</small>
                          <span className={`badge bg-${statusBadgeColor(selectedAduan.status)}`}>
                            {selectedAduan.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-calendar-fill text-primary me-2 mt-1"></i>
                        <div>
                          <small className="text-muted d-block">Tanggal Dibuat</small>
                          <strong>{new Date(selectedAduan.created_at || selectedAduan.waktu_dibuat).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-bottom">
                  <h6 className="mb-3">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Isi Aduan
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                        {selectedAduan.isi_aduan || selectedAduan.isi}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedAduan.tanggapan && Array.isArray(selectedAduan.tanggapan) && selectedAduan.tanggapan.length > 0 && (
                  <div className="p-4 border-bottom">
                    <h6 className="mb-3">
                      <i className="bi bi-chat-left-text me-2"></i>
                      Tanggapan dari Perangkat Desa ({selectedAduan.tanggapan.length})
                    </h6>
                    <div className="timeline">
                      {selectedAduan.tanggapan.slice().reverse().map((t: { id: string; nama_lengkap: string; waktu_dibuat: string; isi_tanggapan: string }, index: number) => (
                        <div key={t.id} className="mb-3">
                          <div className="card border-left-success">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex align-items-center">
                                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                       style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                    {t.nama_lengkap.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong className="d-block">{t.nama_lengkap}</strong>
                                    <small className="text-muted">
                                      <i className="bi bi-clock me-1"></i>
                                      {new Date(t.waktu_dibuat).toLocaleString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </small>
                                  </div>
                                </div>
                                <span className="badge bg-success">Tanggapan #{index + 1}</span>
                              </div>
                              <p className="mb-0 mt-2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                {t.isi_tanggapan}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-light">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted d-block mb-1">
                        <i className="bi bi-calendar-plus me-1"></i>
                        Dibuat
                      </small>
                      <strong>{new Date(selectedAduan.created_at || selectedAduan.waktu_dibuat).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</strong>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block mb-1">
                        <i className="bi bi-calendar-check me-1"></i>
                        Terakhir Update
                      </small>
                      <strong>{new Date(selectedAduan.updated_at || selectedAduan.waktu_diperbarui).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedAduan(null)}
                >
                  <i className="bi bi-x-lg me-2"></i>Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
