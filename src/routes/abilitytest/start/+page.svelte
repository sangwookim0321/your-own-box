<script>
	import { onMount, onDestroy } from 'svelte'
	import { goto } from '$app/navigation'
	import { storeTestData } from '$lib/store/store.js'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
	import useApi from '$lib/util/api'

	const { httpPost, endPoints } = useApi()

	let id = 0 // 테스트 아이디
	let category = '' // 테스트 카테고리

	let items = $storeTestData // 테스트 문제 리스트
	let info = {} // 테스트 정보
	let user_result = {}
	let username = '' // 유저 이름
	let currentQuestionIndex = 0
	let userAnswers = [] // 유저가 선택한 정답 리스트
	let completed = false // 테스트 완료 여부
	let seconds = 0
	let interval

	onMount(async () => {
		id = sessionStorage.getItem('test_id')
		category = sessionStorage.getItem('test_category')

		info = JSON.parse(sessionStorage.getItem('testItems'))
		username = sessionStorage.getItem('test_username')

		interval = setInterval(() => {
			seconds += 1
		}, 1000)

		if ($storeTestData.length === 0) {
			await goto(`/abilitytest/${id}?category=${category}`)
		}
	})

	onDestroy(() => {
		clearInterval(interval)
	})

	$: progressPercentage = (currentQuestionIndex / items.length) * 100

	// Supabase 스토리지의 베이스 URL
	const baseUrl = 'https://aqnmhrbebgwoziqtyyns.supabase.co/storage/v1/object/public/'

	// 이미지의 전체 URL을 계산하는 함수
	function getImageUrl(imgUrl) {
		return `${baseUrl}${imgUrl}`
	}

	function formatTime(seconds) {
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const sec = seconds % 60

		return [hours, minutes, sec].map((v) => String(v).padStart(2, '0')).join(':')
	}

	// 사용자가 답변을 선택했을 때 호출되는 함수
	function selectAnswer(answerIndex) {
		userAnswers[currentQuestionIndex] = answerIndex + 1 // 답변 저장

		if (currentQuestionIndex < items.length - 1) {
			currentQuestionIndex += 1 // 다음 문제로 인덱스 업데이트
		} else {
			completed = true

			result()
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
			items[i].user_answer = userAnswers[i]
		}

		const userAgent = navigator.userAgent.toLowerCase()
		const browser = userAgent.match(/chrome|firefox|safari|opera|msie|trident\//)
			? userAgent.match(/(chrome|firefox|safari|opera|msie|trident)\/?\s*(\d+)/i)[1]
			: 'Unknown Browser'

		let user_result = {
			test_id: parseInt(id),
			test_name: info.title,
			username: username,
			number_q: items.length, // 총 질문 갯수
			correct: correct, // 정답
			wrong: wrong, // 오답
			score: totalScore, // 총 점수
			agent: browser,
			created_at: new Date(),
			seconds: seconds
		}

		await saveResult(user_result)

		storeTestData.set(items)
		sessionStorage.setItem('user_result', JSON.stringify(user_result))

		await goto(`/abilitytest/end/?${id}&category=${category}`)
	}

	async function saveResult(user_result) {
		if (
			!user_result.username ||
			!user_result.test_id ||
			!user_result.test_name ||
			!user_result.number_q ||
			!user_result.agent ||
			!user_result.created_at
		) {
			return
		}

		await httpPost(
			endPoints.ABILITY_TEST_SAVE,
			'abilityTest',
			user_result,
			false,
			(res) => {
				user_result.save_user_id = res.data.data.id
			},
			(err) => {
				console.error(err)
			},
			() => {},
			() => {}
		)
	}
</script>

<main class={info.title === '경상도 사투리 시험' ? 'font-chosun' : 'font-pretendard'}>
	{#if !completed}
		<div class="info_box">
			<div class="info_title">{info.title}</div>
			<div class="info_username">이름 : {username}</div>
			<div class="info_username">시험 시간 : {formatTime(seconds)}</div>
		</div>

		<div class="progress_bar_outer">
			<div class="progress_bar_inner" style="width: {progressPercentage}%;"></div>
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
	.font-chosun {
		font-family: 'ChosunCentennial', sans-serif;
	}
	.font-pretendard {
		font-family: 'Pretendard', sans-serif;
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
		margin: 2rem 0;
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
		padding: 3rem 0;
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
