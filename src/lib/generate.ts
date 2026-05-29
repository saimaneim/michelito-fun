import { readFileSync } from "node:fs";
import { join } from "node:path";
import GIFEncoder from "gifencoder";
import satori from "satori";
import sharp from "sharp";

const fontRegular = readFileSync(
	join(process.cwd(), "public/fonts/NotoSans-Regular.woff"),
);
const fontSemiBold = readFileSync(
	join(process.cwd(), "public/fonts/NotoSans-SemiBold.woff"),
);
const avatarPng = readFileSync(join(process.cwd(), "public/images/avatar.png"));
const avatarBase64 = `data:image/png;base64,${avatarPng.toString("base64")}`;

const FONTS = [
	{ name: "NotoSans", data: fontRegular, weight: 400, style: "normal" },
	{ name: "NotoSans", data: fontSemiBold, weight: 600, style: "normal" },
];

const WIDTH = 520;
const BG_COLOR = "#1c1c24";

export interface GenerateOptions {
	text: string;
	username: string;
	roleColor: string;
	timestamp: string;
}

export async function generateDiscordGif({
	text,
	username,
	roleColor,
	timestamp,
}: GenerateOptions): Promise<Buffer> {
	const charsPerLine = 55;
	const lines = Math.ceil(text.length / charsPerLine);
	const HEIGHT = 24 + 40 + Math.max(0, lines - 1) * 20 + 24;

	const layout = buildLayout({
		text,
		username,
		roleColor,
		timestamp,
		width: WIDTH,
		height: HEIGHT,
	});

	const svg = await satori(layout as any, {
		width: WIDTH,
		height: HEIGHT,
		fonts: FONTS as any,
	});

	const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
	const { data: rawPixels, info } = await sharp(pngBuffer)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	return encodeGif(rawPixels, info.width, info.height);
}

interface LayoutOptions extends GenerateOptions {
	width: number;
	height: number;
}

function buildLayout({
	text,
	username,
	roleColor,
	timestamp,
	width,
	height,
}: LayoutOptions) {
	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				flexDirection: "row",
				alignItems: "flex-start",
				background: BG_COLOR,
				width: `${width}px`,
				height: `${height}px`,
				padding: "12px 16px",
				gap: "12px",
				fontFamily: "NotoSans",
			},
			children: [
				{
					type: "img",
					props: {
						src: avatarBase64,
						width: 40,
						height: 40,
						style: { borderRadius: "50%", flexShrink: 0, marginTop: 1 },
					},
				},
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: 3,
							flex: 1,
						},
						children: [
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										flexDirection: "row",
										alignItems: "baseline",
										gap: 8,
									},
									children: [
										{
											type: "span",
											props: {
												style: {
													color: roleColor,
													fontWeight: 600,
													fontSize: 15,
													lineHeight: 1.2,
													cursor: "pointer",
												},
												children: username,
											},
										},
										{
											type: "span",
											props: {
												style: {
													color: "#a3a6aa",
													fontSize: 11,
													fontWeight: 400,
													lineHeight: 1.2,
												},
												children: timestamp,
											},
										},
									],
								},
							},
							{
								type: "span",
								props: {
									style: {
										color: "#dcddde",
										fontSize: 15,
										fontWeight: 400,
										lineHeight: 1.375,
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
									},
									children: text,
								},
							},
						],
					},
				},
			],
		},
	};
}

function encodeGif(
	rawPixels: Buffer,
	width: number,
	height: number,
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const encoder = new GIFEncoder(width, height);
		const chunks: Uint8Array[] = [];
		const stream = encoder.createReadStream();

		stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(chunks)));
		stream.on("error", reject);

		encoder.start();
		encoder.setRepeat(0);
		encoder.setDelay(0);
		encoder.setQuality(10);
		encoder.addFrame(rawPixels as any);
		encoder.finish();
	});
}
