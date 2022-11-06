import type { Card, CardCreatureAttributes, CardManaParameters, CardMoveParameters } from './types';

export function determineCardValue(card: Card) {
	let value = 0;
	if (card.types?.includes('creature')) {
		const { attack = 0, health = 0 } = card.attributes as CardCreatureAttributes;
		value += attack * 0.5;
		value += health * 0.5;
	}

	value +=
		(card.operations?.find((operation) => operation.instruction === 'dealDamage')?.parameters
			.damage as number) || 0;
	value +=
		(card.operations?.find((operation) => operation.instruction === 'heal')?.parameters
			.heal as number) || 0;

	value +=
		((
			card.operations?.find((operation) => operation.instruction === 'addMana')?.parameters
				.mana as CardManaParameters
		)?.reduce((acc, mana) => acc + mana.value, 0) as number) || 0;

	// +1*amount for move operations
	value +=
		card.operations
			?.filter((operation) => operation.instruction === 'move')
			?.reduce((acc, operation) => acc + (operation.parameters as CardMoveParameters).amount, 0) ||
		0;

	// +.5*amount for scry operations
	value +=
		card.operations
			?.filter((operation) => operation.instruction === 'scry')
			?.reduce(
				(acc, operation) => acc + (operation.parameters as CardMoveParameters).amount * 0.5,
				0
			) || 0;

	// +.5*amount for draw operations
	value +=
		card.operations
			?.filter((operation) => operation.instruction === 'draw')
			?.reduce(
				(acc, operation) => acc + (operation.parameters as CardMoveParameters).amount * 0.5,
				0
			) || 0;

	// 1*amount for exile operations
	value +=
		card.operations
			?.filter((operation) => operation.instruction === 'exile')
			?.reduce((acc, operation) => acc + (operation.parameters as CardMoveParameters).amount, 0) ||
		0;

	// 1*amount for discard operations
	value +=
		card.operations
			?.filter((operation) => operation.instruction === 'discard')
			?.reduce((acc, operation) => acc + (operation.parameters as CardMoveParameters).amount, 0) ||
		0;

	// 1*amount for destroy operations
	value +=
		card.operations
			?.filter((operation) => operation.instruction === 'destroy')
			?.reduce((acc, operation) => acc + (operation.parameters as CardMoveParameters).amount, 0) ||
		0;

	// 1*amount for addCounter operations
	value +=
		card.operations
			?.filter((operation) => operation.instruction === 'addCounter')
			?.reduce((acc, operation) => acc + (operation.parameters as CardMoveParameters).amount, 0) ||
		0;

	return value;
}
