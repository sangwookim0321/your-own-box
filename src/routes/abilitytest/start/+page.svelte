<script>
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { storeTestData } from '$lib/store/store.js'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'

	console.log($storeTestData)
	let id = 0
	let category = ''

	let items = $storeTestData
	let info = {}
	let username = ''
	let currentQuestionIndex = 0
	let userAnswers = []
	let message = ''
	let completed = false

	onMount(async () => {
		id = sessionStorage.getItem('test_id')
		category = sessionStorage.getItem('test_category')

		info = JSON.parse(sessionStorage.getItem('testItems'))
		username = sessionStorage.getItem('test_username')

		if ($storeTestData.length === 0) {
			await goto(`/abilitytest/${id}?category=${category}`)
		}
	})

	$: progressPercentage = (currentQuestionIndex / items.length) * 100

	// Supabase 스토리지의 베이스 URL
	const baseUrl = 'https://aqnmhrbebgwoziqtyyns.supabase.co/storage/v1/object/public/'

	// 이미지의 전체 URL을 계산하는 함수
	function getImageUrl(imgUrl) {
		return `${baseUrl}${imgUrl}`
	}

	// 사용자가 답변을 선택했을 때 호출되는 함수
	function selectAnswer(answerIndex) {
		userAnswers[currentQuestionIndex] = answerIndex + 1 // 답변 저장

		console.log('userAnswers : ', userAnswers)
		if (currentQuestionIndex < items.length - 1) {
			currentQuestionIndex += 1 // 다음 문제로 인덱스 업데이트
		} else {
			// 모든 문제에 답변했다면 결과 처리 로직을 여기에 추가
			console.log('Test completed', userAnswers)
			completed = true

			result()
			// goto('/some-result-page'); // 모든 문제를 답변한 후 결과 페이지로 이동 등
		}
	}

	async function result() {
		// 유저의 정답확인
		let correct = 0
		let wrong = 0
		let totalScore = 0

		for (let i = 0; i < items.length; i++) {
			if (items[i].answer === userAnswers[i]) {
				correct++
				items[i].result = 'correct'

				if (items[i].score != null && items[i].score != undefined) {
					totalScore += parseInt(items[i].score)
				}
			} else {
				wrong++
				items[i].result = 'wrong'
			}
		}

		const user_result = {
			test_id: parseInt(id),
			test_name: info.title,
			username: username,
			number_q: items.length, // 총 질문 갯수
			correct: correct, // 정답
			wrong: wrong, // 오답
			score: totalScore, // 총 점수
			message: message, // 유저 피드백 메세지
			agent: navigator.userAgent.toLowerCase(),
			create_at: new Date()
		}

		sessionStorage.setItem('user_result', JSON.stringify(user_result))

		await goto(`/abilitytest/end${id}?category=${category}`)
	}
</script>

<main>
	{#if !completed}
		<div class="progress_bar_outer">
			<div class="progress_bar_inner" style="width: {progressPercentage}%;"></div>
		</div>

		<div class="info_box">
			<div class="info_title">{info.title}</div>
			<div class="info_username">이름 : {username}</div>
		</div>
		{#if items.length > 0}
			<div class="test_box">
				<div class="question">
					{items[currentQuestionIndex].question_number}.{items[currentQuestionIndex].question_name}
				</div>
				{#if items[currentQuestionIndex].sub_img_url}
					<div class="question_img">
						<img src={getImageUrl(items[currentQuestionIndex].sub_img_url)} alt="question_img" />
					</div>
				{/if}
				{#if items[currentQuestionIndex].question_etc}
					<div class="question_etc" contenteditable="false">
						{@html items[currentQuestionIndex].question_etc}
					</div>
				{/if}
				<div class="question_list">
					{#each items[currentQuestionIndex].question_list as option, index}
						<span on:click={() => selectAnswer(index)}>{option}</span>
					{/each}
				</div>
			</div>
		{/if}
	{/if}

	{#if completed}
		<div class="loading_box">
			<LoadingSpinner />
			<p>잠시만 기다려 주세요 :)</p>
		</div>
	{/if}
</main>

<style>
	div {
		font-family: 'ChosunCentennial', sans-serif;
	}
	.loading_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 50vh;
	}
	.loading_box p {
		padding-top: 2rem;
		font-size: 2rem;
	}
	.progress_bar_outer {
		width: 100%;
		height: 20px;
		background-color: var(--main-bg-lightGray);
		border-radius: 10px;
		overflow: hidden;
	}
	.progress_bar_inner {
		height: 100%;
		background-color: var(--main-bg-purple);
		transition: width 0.5s ease-in-out;
	}
	.info_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 5rem;
		border-bottom: 2px solid var(--main-bg-gray);
	}
	.info_title {
		font-size: 4rem;
		font-weight: 700;
	}
	.info_username {
		padding-top: 2rem;
		font-size: 2rem;
		color: var(--main-bg-gray);
	}
	.test_box {
		padding-top: 5rem;
	}
	.question {
		font-size: 2.2rem;
		padding-bottom: 2rem;
	}
	.question_etc {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		font-size: 1.6rem;
		font-family: 'ChosunCentennial', sans-serif;
		padding: 20px;
		border: 1px solid var(--main-bg-gray);
		overflow: auto;
		white-space: pre-wrap;
		line-height: 1.5;
	}
	.question_img {
		padding-bottom: 2rem;
		display: flex;
		justify-content: center;
	}
	.question_img img {
		width: 100%;
		max-width: 200px;
	}
	.question_list {
		padding-top: 2rem;
		display: flex;
		flex-direction: column;
	}
	.question_list span {
		padding: 1rem;
		margin: 1rem 0;
		cursor: pointer;
	}
	.question_list span:hover {
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.info_box {
			padding: 2rem;
		}
		.info_title {
			font-size: 2rem;
		}
		.info_username {
			font-size: 1.2rem;
		}
		.test_box {
			padding-top: 2rem;
		}
		.question {
			font-size: 1.6rem;
		}
		.question_etc {
			font-size: 1.5rem;
		}
		.question_list span {
			padding: 0.5rem;
			margin: 0.5rem 0;
		}
		.question_list span:hover {
			font-weight: 500;
		}
	}
</style>
