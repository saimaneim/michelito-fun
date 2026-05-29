"use client";

import { useEffect, useState } from "react";

function getTimestamp() {
	const now = new Date();
	const h = now.getHours() % 12 || 12;
	const m = now.getMinutes().toString().padStart(2, "0");
	return `${h}:${m}`;
}

export default function Home() {
	const [text, setText] = useState("");
	const [username, setUsername] = useState("Michelito");
	const [color, setColor] = useState("#2ECC71");
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [timestamp, setTimestamp] = useState(getTimestamp());

	const [loading, setLoading] = useState(false);
	const [resultUrl, setResultUrl] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimestamp(getTimestamp());
		}, 30000);
		return () => clearInterval(interval);
	}, []);

	const syncColorFromHex = (val: string) => {
		if (/^#[0-9a-fA-F]{6}$/.test(val)) {
			setColor(val);
		}
	};

	const handleGenerate = async () => {
		if (!text.trim()) return;

		setLoading(true);
		setResultUrl(null);
		setErrorMsg(null);

		try {
			const res = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text: text.trim(),
					username: username || "Michelito",
					roleColor: color,
					timestamp,
				}),
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Error desconocido");
			}

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			setResultUrl(url);

			const a = document.createElement("a");
			a.href = url;
			a.download = `michelito-${Date.now()}.gif`;
			a.click();
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="card">
				<div className="preview-area">
					{!text.trim() ? (
						<div className="preview-placeholder">
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<title>Text message square</title>
								<rect x="3" y="3" width="18" height="18" rx="3" />
								<path d="M3 9h18M9 21V9" />
							</svg>
							<span>La preview aparece aquí</span>
						</div>
					) : (
						<div className="preview-message visible">
							<div className="msg-avatar" />
							<div className="msg-content">
								<div className="msg-header">
									<span className="msg-username" style={{ color }}>
										{username || "Michelito"}
									</span>
									<span className="msg-timestamp">Hoy a las {timestamp}</span>
								</div>
								<div className="msg-text">{text}</div>
							</div>
						</div>
					)}
				</div>

				<div className="form-area">
					<div className="field">
						<label htmlFor="message">Mensaje</label>
						<textarea
							id="message"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="¿Qué dice Michelito?"
							rows={3}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleGenerate();
								}
							}}
						/>
					</div>

					<div
						className="advanced-toggle"
						onClick={() => setShowAdvanced(!showAdvanced)}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							style={{ transform: showAdvanced ? "rotate(180deg)" : "none" }}
						>
							<title>chevron down</title>
							<polyline points="6 9 12 15 18 9" />
						</svg>
						Personalizar
					</div>

					{showAdvanced && (
						<div className="advanced-fields open">
							<div className="fields-row">
								<div className="field">
									<label htmlFor="username">Nombre de usuario</label>
									<input
										type="text"
										id="username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
									/>
								</div>
								<div className="color-field">
									<label htmlFor="color">Color del nombre</label>
									<div className="color-row">
										<input
											type="color"
											id="color"
											value={color}
											onChange={(e) => setColor(e.target.value)}
										/>
										<input
											type="text"
											className="color-hex"
											value={color}
											onChange={(e) => {
												setColor(e.target.value);
												syncColorFromHex(e.target.value);
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					<button
						type="button"
						className={`btn-generate ${loading ? "loading" : ""}`}
						disabled={loading}
						onClick={handleGenerate}
					>
						<span className="spinner"></span>
						<span className="btn-label">✨ Generar GIF</span>
					</button>
				</div>

				{resultUrl && (
					<div className="result visible">
						<div className="result-icon">🎉</div>
						<div className="result-text">
							<strong>GIF listo</strong>
							<span>Descárgalo y guárdalo en Discord con ⭐</span>
						</div>
						<a
							className="btn-download"
							href={resultUrl}
							download="michelito.gif"
						>
							Descargar
						</a>
					</div>
				)}

				{errorMsg && (
					<div className="error visible">
						<span>⚠️</span>
						<span>{errorMsg}</span>
					</div>
				)}
			</div>

			<div className="footer">hecho con amor para el server 💚</div>
		</div>
	);
}
