"use client";

import {useEffect, useState} from "react";

interface Sponsor {
	id?: number | string;
	name: string;
	logo_url?: string | null;
	tagline?: string | null;
	url?: string | null;
}

interface SponsorBannerProps {
	category: string;
}

export default function SponsorBanner({category}: SponsorBannerProps) {
	const [sponsor, setSponsor] = useState<Sponsor | null>(null);
	const [loading, setLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (!category || category.toLowerCase() === "all") {
			setSponsor(null);
			setLoading(false);
			setHasError(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setHasError(false);

		(async () => {
			try {
				const res = await fetch(
					`/api/sponsors/category/${encodeURIComponent(category.toLowerCase())}`,
					{
						cache: "no-store",
					},
				);
				if (!cancelled) {
					if (!res.ok) {
						setSponsor(null);
						setHasError(true);
					} else {
						const data = await res.json();
						setSponsor(data.sponsor ?? null);
					}
				}
			} catch {
				if (!cancelled) {
					setSponsor(null);
					setHasError(true);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [category]);

	if (!category || category.toLowerCase() === "all") return null;

	if (loading) {
		return <div className="mb-8 skeleton h-24 rounded-2xl" />;
	}

	// Empty state: no sponsor for this category
	if (!sponsor || hasError) {
		return (
			<div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-dashed border-stardust bg-stardust/20 px-5 py-4">
				<span className="text-sm text-ash">
					No sponsor for {category} yet.
				</span>
				<a
					href={`mailto:sponsor@stellarwave.dev?subject=Sponsor%20the%20${encodeURIComponent(category)}%20category`}
					className="text-sm font-medium text-nova hover:underline"
				>
					Sponsor this category
				</a>
			</div>
		);
	}

	const logo = sponsor.logo_url;
	const href = sponsor.url;
	const tagline = sponsor.tagline;
	const name = sponsor.name;

	const inner = (
		<>
			<div className="flex items-center gap-3 min-w-0">
				{logo ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={logo}
						alt={`${name} logo`}
						className="h-10 w-10 rounded-lg object-contain bg-white/5 shrink-0"
					/>
				) : (
					<div className="h-10 w-10 rounded-lg bg-nova/20 flex items-center justify-center shrink-0">
						<span className="text-nova font-bold">
							{name.charAt(0).toUpperCase()}
						</span>
					</div>
				)}
				<div className="min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-semibold text-starlight truncate">
							{name}
						</span>
						<span className="inline-flex items-center rounded-full bg-nova/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nova">
							Sponsored
						</span>
					</div>
					{tagline && (
						<p className="text-sm text-ash truncate">{tagline}</p>
					)}
				</div>
			</div>
			{/* Learn more indicator */}
			{href && (
				<div className="shrink-0 text-sm font-medium text-nova inline-flex items-center gap-1">
					Learn more
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M7 17 21 7m0-14-7 7" />
					</svg>
				</div>
			)}
		</>
	);

	return (
		<div
			className="mb-8 rounded-2xl border border-stardust/40 bg-stardust/20 px-5 py-4"
			aria-label={`Sponsored by ${name} for the ${category} category`}
		>
			{href ? (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer nofollow sponsored"
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:opacity-90 transition-opacity"
				>
					{inner}
				</a>
			) : (
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					{inner}
				</div>
			)}
		</div>
	);
}