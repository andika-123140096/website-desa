import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SuratPBB } from '../../types';
import { formatStatusPembayaran, getStatusPembayaranColor } from '../../utils/formatters';

interface PerangkatDesa {
  id: string;
  nama_lengkap: string;
  username: string;
  jabatan: string;
  nama_dusun?: string;
}

interface DusunInfo {
  id: number;
  nama_dusun: string;
  status_data_pbb: string;
}

export function DashboardKepalaDusun() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('ketua-rt');
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([]);
  const [ketuaRT, setKetuaRT] = useState<PerangkatDesa[]>([]);
  const [dusunInfo, setDusunInfo] = useState<DusunInfo | null>(null);
  const [dusunId, setDusunId] = useState<number | null>(null);

  useEffect(() => {
    const loadDusunInfo = async () => {
      if (!user?.id || !token) return;
      
      try {
        const response = await fetch(`/api/perangkat-desa/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const perangkat = await response.json();
        
        if (response.ok && perangkat.id_dusun) {
          setDusunId(perangkat.id_dusun);
          const dusunResponse = await fetch(`/api/dusun/${perangkat.id_dusun}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const dusun = await dusunResponse.json();
          setDusunInfo(dusun);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    loadDusunInfo();
  }, [user, token]);

  useEffect(() => {
    const loadTabData = async () => {
      if (!token) return;
      
      if (activeTab === 'ketua-rt' && dusunId) {
        try {
          const response = await fetch(`/api/perangkat-desa?dusun_id=${dusunId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          if (response.ok) {
            const ketuaList = result.filter((p: PerangkatDesa) => p.jabatan === 'ketua_rt');
            setKetuaRT(ketuaList);
          }
        } catch (err) {
          console.error(err);
        }
      }
      
      if (activeTab === 'surat-pbb') {
        try {
          const response = await fetch('/api/surat-pbb', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          if (response.ok) setSuratPBB(result);
        } catch (err) {
          console.error(err);
        }
      }
    };
    
    loadTabData();
  }, [activeTab, dusunId, token]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard Kepala Dusun</h2>
          {dusunInfo && (
            <p className="text-muted mb-0">
              <i className="bi bi-geo-alt me-2"></i>{dusunInfo.nama_dusun}
            </p>
          )}
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ketua-rt' ? 'active' : ''}`}
            onClick={() => setActiveTab('ketua-rt')}
          >
            <i className="bi bi-people me-2"></i>Daftar Ketua RT
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'surat-pbb' ? 'active' : ''}`}
            onClick={() => setActiveTab('surat-pbb')}
          >
            <i className="bi bi-file-text me-2"></i>Surat PBB
          </button>
        </li>
      </ul>

      {activeTab === 'ketua-rt' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0"><i className="bi bi-people me-2"></i>Daftar Ketua RT di {dusunInfo?.nama_dusun || 'Dusun Ini'}</h6>
          </div>
          <div className="card-body p-0">
            {ketuaRT.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <p className="mt-2 mb-0">Belum ada Ketua RT yang terdaftar di dusun ini</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Lengkap</th>
                      <th>Username</th>
                      <th>Jabatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ketuaRT.map((ketua, index) => (
                      <tr key={ketua.id}>
                        <td>{index + 1}</td>
                        <td>{ketua.nama_lengkap}</td>
                        <td>{ketua.username}</td>
                        <td>
                          <span className="badge bg-info">Ketua RT</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'surat-pbb' && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0"><i className="bi bi-file-text me-2"></i>Daftar Surat PBB di {dusunInfo?.nama_dusun || 'Dusun Ini'}</h6>
          </div>
          <div className="card-body p-0">
            {suratPBB.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <p className="mt-2 mb-0">Belum ada surat PBB yang terdaftar</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>NOP</th>
                      <th>Nama Wajib Pajak</th>
                      <th>Alamat</th>
                      <th>Tahun</th>
                      <th>Jumlah Pajak</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suratPBB.map((s) => (
                      <tr key={s.id}>
                        <td>{s.nomor_objek_pajak}</td>
                        <td>{s.nama_wajib_pajak}</td>
                        <td>{s.alamat_objek_pajak}</td>
                        <td>{s.tahun_pajak}</td>
                        <td>Rp {Number(s.jumlah_pajak_terhutang).toLocaleString('id-ID')}</td>
                        <td>
                          <span className={`badge bg-${getStatusPembayaranColor(s.status_pembayaran)}`}>
                            {formatStatusPembayaran(s.status_pembayaran)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
