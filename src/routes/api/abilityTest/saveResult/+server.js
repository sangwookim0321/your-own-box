import { supabase } from '$lib/util/supabaseClient'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	// 능력고사 테스트 유저 결과 저장 API
	const { agent, correct, wrong, created_at, number_q, score, test_id, test_name, username } =
		await request.json()

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
		const { data, error } = await supabase
			.from('ability_tests_result')
			.insert([
				{
					agent,
					correct,
					wrong,
					created_at,
					number_q,
					score,
					test_id,
					test_name,
					username
				}
			])
			.select('id')

		if (error) {
			console.error('테스트 결과 저장 실패:', error)
			throw { status: 400, message: 'server error', error }
		}

		return json(
			{
				data: data[0],
				message: 'success',
				status: 200
			},
			{ status: 200 }
		)
	} catch (err) {
		console.error('server error:', err)
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

export async function PATCH({ request, params }) {
	// 능력고사 테스트 유저 결과 메세지 업데이트 API
	const { id, message } = await request.json()

	if (!id || !message) {
		return json(
			{
				message: 'Bad Request',
				status: 400,
				error: 'Bad Request'
			},
			{ status: 400 }
		)
	}

	try {
		const { data, error } = await supabase
			.from('ability_tests_result')
			.update({ message })
			.eq('id', id)

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
		console.error('server error:', err)
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
