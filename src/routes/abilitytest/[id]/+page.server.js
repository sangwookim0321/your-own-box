import { supabase } from '$lib/util/supabaseClient'

export async function load({ params, url }) {
	const { id } = params

	const { data: abilityTest, error: abilityTestError } = await supabase
		.from('ability_tests')
		.select()
		.eq('id', id)

	if (abilityTestError) {
		console.error('error', abilityTestError)
		return { status: 500, error: new Error('Unable to fetch ability test') }
	}

	const { data: abilityTestItems, error: abilityTestItemsError } = await supabase
		.from('ability_questions')
		.select()
		.eq('test_id', id)
		.order('question_number', { ascending: true })

	if (abilityTestItemsError) {
		console.error('error', abilityTestItemsError)
		return { status: 500, error: new Error('Unable to fetch ability test items') }
	}

	const { data, error } = await supabase.rpc('increment', {
		x: 1,
		row_id: id,
		table_name: 'ability_tests'
	})

	if (error) {
		console.error('error', error)
		return { status: 500, error: new Error('Unable to increment') }
	}

	return {
		props: {
			abilityTest: abilityTest[0],
			abilityTestItems
		}
	}
}
