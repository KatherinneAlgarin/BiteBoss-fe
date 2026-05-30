type PathKey = string | number | Array<string | number>;

function toPath(path: PathKey): Array<string | number> {
	if (Array.isArray(path)) return path;
	return String(path)
		.split('.')
		.filter(segment => segment.length > 0)
		.map(segment => (String(Number(segment)) === segment ? Number(segment) : segment));
}

function get(value: unknown, path: PathKey, defaultValue?: unknown): unknown {
	const segments = toPath(path);
	let current: any = value;

	for (const segment of segments) {
		if (current == null) return defaultValue;
		current = current[segment as keyof typeof current];
	}

	return current === undefined ? defaultValue : current;
}

export default get;
