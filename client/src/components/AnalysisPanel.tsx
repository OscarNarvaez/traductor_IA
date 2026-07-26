import type { Analysis } from '../api'
import './analysis-panel.css'

export function AnalysisPanel({ data, notice }: { data?: Analysis; notice?: string }) {
    if (notice) {
        return (
            <div className="panel">
                <p className="muted">{notice}</p>
            </div>
        )
    }

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
                        <h3>Así lo diría un nativo</h3>
                        <ul className="alternatives">
                            {data.nativeAlternatives.map((alt, i) => (
                                <li
                                    key={i}
                                    className="alternative"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    {alt}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={`block correction-block ${data.hasErrors ? 'has-errors' : 'no-errors'}`}>
                        <h3>{data.hasErrors ? 'Corrección del texto original' : '¡Bien hecho!'}</h3>
                        <p className="feedback">{data.feedback}</p>
                        <p className="mono">{data.originalCorrection}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
