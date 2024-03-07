import { supabase } from '$lib/util/supabaseClient'

export async function load({ params, url }) {
	const { id } = params

	const { data: abilityTestItems, error: abilityTestError } = await supabase
		.from('ability_questions')
		.select()
		.eq('test_id', id)
		.order('question_number', { ascending: true })

	if (abilityTestError) {
		console.error('error', abilityTestError)
		return { status: 500, error: new Error('Unable to fetch ability test items') }
	}

	return {
		props: {
			abilityTestItems
		}
	}
}
