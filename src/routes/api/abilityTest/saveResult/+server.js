import { supabase } from '$lib/util/supabaseClient'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	// 능력고사 테스트 유저 결과 저장 API
	const {
		agent,
		correct,
		wrong,
		created_at,
		number_q,
		score,
		test_id,
		test_name,
		username,
		message
	} = await request.json()

	if (
		!agent ||
		!correct ||
		!wrong ||
		!created_at ||
		!number_q ||
		!score ||
		!test_id ||
		!test_name ||
		!username
	) {
		return json(
			{
				message: 'POST Bad Request',
				status: 400,
				error: 'Bad Request'
			},
			{ status: 400 }
		)
	}

	try {
		// db 저장 로직
		const { data, error } = await supabase.from('ability_tests_result').insert([
			{
				agent,
				correct,
				wrong,
				created_at,
				number_q,
				score,
				test_id,
				test_name,
				username,
				message
			}
		])

		if (error) {
			throw new Error(error.message)
		}

		return json(
			{
				message: 'success',
				status: 200
			},
			{ status: 200 }
		)
	} catch (err) {
		console.error('서버 오류:', err)
		return json(
			{
				message: err.message,
				status: err.status || 400,
				error: err.error || '서버 오류'
			},
			{ status: err.status || 500 }
		)
	}
}
