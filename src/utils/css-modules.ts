import { Config } from '@/types';

export function shouldCssModules(options: Config) {
	const passedInOption = processCssmodulesArgument(options.cssModules);

	// We should module when my-file.module.css or my-file.css
	const moduleAllCss = passedInOption === true;

	// We should module when my-file.module.css
	const allowOnlySuffixModule = passedInOption === null;

	return moduleAllCss || allowOnlySuffixModule;
}

/**
 * This is done because if you use the cli default property, you get a primiatve "null" or "false",
 * but when using the cli arguments, you always get back strings. This method aims at correcting those
 * for both realms. So that both realms _convert_ into primatives.
 */
function processCssmodulesArgument(cssModules: Config['cssModules'] | string) {
	if (cssModules === 'true' || cssModules === true)
		return true;
	if (cssModules === 'false' || cssModules === false)
		return false;
	if (cssModules === 'null' || cssModules === null)
		return null;

	return cssModules;
}

export function cssModulesConfig(options: Config & { watch?: boolean }) {
	const passedInOption = processCssmodulesArgument(options.cssModules);
	const isWatchMode = options.watch;
	const hasPassedInScopeName = !(
		typeof passedInOption === 'boolean' || passedInOption === null
	);

	if (shouldCssModules(options) || hasPassedInScopeName) {
		let generateScopedName: string | Config['cssModules'] = isWatchMode
			? '_[name]__[local]__[hash:base64:5]'
			: '_[hash:base64:5]';

		if (hasPassedInScopeName) {
			generateScopedName = passedInOption; // would be the string from --css-modules "_[hash]".
		}

		return { generateScopedName };
	}

	return false;
}
