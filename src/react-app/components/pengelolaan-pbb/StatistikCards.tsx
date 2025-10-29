interface StatistikData {
  totalPajakTerhutang: number
  totalPajakDibayar: number
  totalSurat: number
  totalSuratDibayar: number
  totalSuratBelumBayar: number
  persentasePembayaran: number
}

interface StatistikCardsProps {
  data: StatistikData
  showStatistics: boolean
  onToggle: () => void
}

export function StatistikCards({ data, showStatistics, onToggle }: StatistikCardsProps) {
  return (
    <div className="card mb-4">
      <div className="card-header" style={{ cursor: "pointer" }} onClick={onToggle}>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-bar-chart me-2"></i>Statistik PBB
          </h6>
          <i className={`bi bi-chevron-${showStatistics ? "up" : "down"}`}></i>
        </div>
      </div>
      {showStatistics && (
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card border-primary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Pajak Terhutang</div>
                      <div className="h4 mb-0 text-primary">Rp {data.totalPajakTerhutang.toLocaleString("id-ID")}</div>
                    </div>
                    <i className="bi bi-wallet2 text-primary" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-success h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Pajak Terbayar</div>
                      <div className="h4 mb-0 text-success">Rp {data.totalPajakDibayar.toLocaleString("id-ID")}</div>
                    </div>
                    <i className="bi bi-check-circle text-success" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-info h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Persentase Pembayaran</div>
                      <div className="h4 mb-0 text-info">{data.persentasePembayaran.toFixed(1)}%</div>
                    </div>
                    <i className="bi bi-percent text-info" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-secondary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Surat</div>
                      <div className="h4 mb-0 text-secondary">{data.totalSurat}</div>
                    </div>
                    <i className="bi bi-file-text text-secondary" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-success h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Surat Sudah Dibayar</div>
                      <div className="h4 mb-0 text-success">{data.totalSuratDibayar}</div>
                    </div>
                    <i className="bi bi-check2-square text-success" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-warning h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Surat Belum Dibayar</div>
                      <div className="h4 mb-0 text-warning">{data.totalSuratBelumBayar}</div>
                    </div>
                    <i className="bi bi-exclamation-square text-warning" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
