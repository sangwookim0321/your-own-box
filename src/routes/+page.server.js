import { supabase } from '$lib/util/supabaseClient'

export async function load({ params }) {
	const { data: abilityTests, error: abilityTestsError } = await supabase
		.from('ability_tests')
		.select('*')
		.eq('release', true)

	if (abilityTestsError) {
		console.error('error', abilityTestsError)
		return { status: 500, error: new Error('Unable to fetch ability tests') }
	}

	const { data: mbtiTests, error: mbtiTestsError } = await supabase
		.from('mbti_tests')
		.select('*')
		.eq('release', true)

	if (mbtiTestsError) {
		console.error('error', mbtiTestsError)
		return { status: 500, error: new Error('Unable to fetch mbti tests') }
	}

	const combinedData = [...abilityTests, ...mbtiTests]

	combinedData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

	return {
		props: {
			combinedData
		}
	}
}
