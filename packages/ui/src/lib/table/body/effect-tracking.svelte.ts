/** Whether the caller runs inside a tracking context: an effect or a derived being computed. */
export function insideEffect(): boolean {
	return $effect.tracking();
}
