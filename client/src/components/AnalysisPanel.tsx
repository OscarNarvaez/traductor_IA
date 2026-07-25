import type { Analysis } from '../api'
import './analysis-panel.css'

export function AnalysisPanel({ data }: { data?: Analysis }) {
    if (!data) {
        return (
            <div className="panel">
                <p className="muted">Aquí verás las correcciones y explicaciones.</p>
            </div>
        )
    }

    return (
        <div className="panel">
            <div className="reveal">
                <div className="reveal-inner">
                    <div className="block">
                        <h3>Corrección del texto original</h3>
                        <p className="mono">{data.originalCorrection}</p>
                    </div>

                    <div className="block">
                        <h3>Explicaciones</h3>
                        {data.explanations?.length ? (
                            <ul className="explanations">
                                {data.explanations.map((e, i) => (
                                    <li
                                        key={i}
                                        className="explanation"
                                        style={{ animationDelay: `${i * 60}ms` }}
                                    >
                                        {e.type && <span className="tag">{e.type}</span>}
                                        <div className="reason">{e.reason}</div>
                                        {(e.original || e.corrected) && (
                                            <div className="pair">
                                                {e.original && <div><strong>Tu versión:</strong> {e.original}</div>}
                                                {e.corrected && <div><strong>Correcto:</strong> {e.corrected}</div>}
                                            </div>
                                        )}
                                        {e.example && (
                                            <div className="pair">
                                                <div><strong>Ej. mal:</strong> {e.example.wrong}</div>
                                                <div><strong>Ej. bien:</strong> {e.example.right}</div>
                                            </div>
                                        )}
                                        {e.tip && <div className="tip">💡 {e.tip}</div>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="muted">Sin observaciones adicionales.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
