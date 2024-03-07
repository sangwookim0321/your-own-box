<script>
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { storeTestData } from '$lib/store/store.js'
	import { formatDate, formatComma } from '$lib/util/filter'
	import { showToast, showAlert } from '$lib/util/alerts'
	import useApi from '$lib/util/api'

	const { httpPost, endPoints } = useApi()

	let items = $storeTestData // 테스트 문제 리스트
	let id = 0 // 테스트 아이디
	let category = '' // 테스트 카테고리
	let info = {} // 테스트 정보
	let username = '' // 유저 이름
	let userResult = {} // 유저 시험 결과
	let user_message = '' // 유저 후기

	let rank = '' // 랭크
	let admin_message = ''

	onMount(async () => {
		id = sessionStorage.getItem('test_id')
		category = sessionStorage.getItem('test_category')

		info = JSON.parse(sessionStorage.getItem('testItems'))
		username = sessionStorage.getItem('test_username')
		userResult = JSON.parse(sessionStorage.getItem('user_result'))

		calcRank()

		if ($storeTestData.length === 0) {
			await goto(`/abilitytest/${id}?category=${category}`)
		}

		saveResult()
	})

	// Supabase 스토리지의 베이스 URL
	const baseUrl = 'https://aqnmhrbebgwoziqtyyns.supabase.co/storage/v1/object/public/'

	function sweetToast(title, icon) {
		showToast({
			title: title,
			icon: icon
		})
	}

	function sweetAlert(title, text, icon, isCancel, confirmButtonText, cancelButtonText, callback) {
		showAlert({
			title: title,
			text: text,
			icon: icon,
			isCancel: isCancel,
			confirmButtonText: confirmButtonText,
			cancelButtonText: cancelButtonText,
			callback: callback
		})
	}

	// 이미지의 전체 URL을 계산하는 함수
	function getImageUrl(imgUrl) {
		return `${baseUrl}${imgUrl}`
	}

	function toTop() {
		// 화면 상단 이동
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	async function resetTest() {
		// 테스트 다시하기
		await goto(`/abilitytest/start/?${username}`)
	}

	async function goHome() {
		// 홈으로 이동
		sweetAlert('홈으로 이동', '홈으로 이동하시겠습니까?', 'question', true, '확인', '취소', () => {
			goto('/')
		})
		// await goto('/')
	}

	async function copyLink() {
		// 테스트 링크 복사
		const url = `${window.location.origin}/abilitytest/${id}?category=${category}`

		try {
			await navigator.clipboard.writeText(url)
			sweetToast('테스트 링크 복사완료', 'success')
		} catch (err) {
			sweetToast('테스트 링크 복사실패', 'error')
		}
	}

	function calcRank() {
		// 'correct' 결과를 가진 항목의 수를 계산
		const correctCount = items.filter((item) => item.result === 'correct').length
		// 전체 항목 수 대비 정답의 비율을 계산
		const correctPercentage = (correctCount / items.length) * 100

		// 비율에 따라 랭크 결정
		if (correctPercentage >= 100) {
			rank = '챌린저'
			admin_message = '모든 문제를 다 맞추셨어요! 정말 대단하신데요?!'
		} else if (correctPercentage >= 90) {
			rank = '다이아'
			admin_message = '정말 잘하셨어요! 다이아급 실력이시네요!'
		} else if (correctPercentage >= 70) {
			rank = '플래티넘'
			admin_message = '플래티넘급 실력이시네요! 잘하셨어요!'
		} else if (correctPercentage >= 50) {
			rank = '골드'
			admin_message = '골드급 실력이시네요~ 살짝 아쉽지만 잘하셨어요!'
		} else if (correctPercentage >= 30) {
			rank = '실버'
			admin_message = '실버급 실력이시네요... 조금 더 노력해보세요!'
		} else if (correctPercentage >= 10) {
			rank = '브론즈'
			admin_message = '브론즈급 실력이시네요; 흠...'
		} else {
			rank = '아이언'
			admin_message = '아이언급... 실력이시네요.. 파이팅;'
		}
	}

	// rank 값에 따라 적용할 클래스 이름을 반환하는 함수
	function rankClass(rank) {
		const rankClasses = {
			챌린저: 'color_challenger',
			다이아: 'color_diamond',
			플래티넘: 'color_platinum',
			골드: 'color_gold',
			실버: 'color_silver',
			브론즈: 'color_bronze',
			아이언: 'color_iron'
		}
		return rankClasses[rank] || ''
	}

	function sendMessage() {
		// 유저 후기 등록
		if (!user_message) {
			sweetToast('내용을 입력해주세요', 'warning')
			return
		}

		userResult.message = user_message

		saveResult()
	}

	async function saveResult() {
		if (
			!userResult.agent ||
			!userResult.correct ||
			!userResult.wrong ||
			!userResult.score ||
			!userResult.created_at ||
			!userResult.number_q ||
			!userResult.test_id ||
			!userResult.username ||
			!userResult.test_name
		) {
			return
		}

		await httpPost(
			endPoints.ABILITY_TEST_SAVE,
			'abilityTest',
			userResult,
			false,
			(res) => {},
			(err) => {
				console.error(err)
			},
			() => {},
			() => {}
		)
	}
</script>

<main>
	<div class="info_box">
		<div class="info_title">{info.title} 결과</div>
		<div class="info_username">이름 : {username}</div>
		<div class="info_date">날짜 : {formatDate(userResult.created_at)}</div>
	</div>
	<div class="result_box">
		<div class="result_group_box">
			<div class="result_box_01">정답 / 오답</div>
			<div class="result_box_02">점수</div>
			<div class="result_box_03">랭크</div>
		</div>
		<div class="result_group_box">
			<div class="result_box_04">{userResult.correct} / {userResult.wrong}</div>
			<div class="result_box_05">
				{userResult.score ? `${userResult.score}점` : '점수가 등록되지 않은 시험 입니다.'}
			</div>
			<div class="result_box_06 {rankClass(rank)}">{rank}</div>
		</div>
	</div>

	<div class="admin_message_box">
		{admin_message}
	</div>

	<div class="middle_box">
		<div class="main_logo_box">
			<div class="main_logo_inner_box" on:click={goHome}>
				<img src="/imgs/main-logo-128.png" alt="main-logo" />
				<span>너만의 상자, 하디닷컴</span>
			</div>
		</div>
		<div class="main_text_box"></div>
		<div class="main_icon_box">
			<div style="padding-right: 2rem;" class="main_link_box" on:click={copyLink}>
				<img src="/imgs/icon_link.svg" alt="link-icon" />
				<p>테스트 링크 복사</p>
			</div>
			<div style="padding-left: 2rem;" class="main_reset_box" on:click={resetTest}>
				<img src="/imgs/icon_reset.svg" alt="reset-icon" />
				<p>테스트 다시하기</p>
			</div>
		</div>

		<div class="feedback_box">
			<input type="text" placeholder="후기 또는 피드백을 남겨주세요!" bind:value={user_message} />
			<button on:click={sendMessage}>등록</button>
		</div>
	</div>

	<div class="question_box">
		<div class="info_title">{info.title} 채점결과</div>
	</div>
	{#each items as item, index}
		<div class="test_box">
			<div class="question">
				{item.question_number}.{item.question_name}
				{#if item.result === 'correct'}
					<img src="/imgs/icon_red_circle.svg" alt="정답 아이콘" />
				{:else}
					<img src="/imgs/icon_red_close.svg" alt="오답 아이콘" />
				{/if}
			</div>
			{#if item.sub_img_url}
				<div class="question_img">
					<img src={getImageUrl(item.sub_img_url)} alt="question_img" />
				</div>
			{/if}
			{#if item.question_etc}
				<div class="question_etc" contenteditable="false">
					{@html item.question_etc}
				</div>
			{/if}
			<div class="question_list">
				{#each item.question_list as option, index2}
					<span class={item.user_answer === index2 + 1 ? 'answer_class' : ''}>{option}</span>
				{/each}
			</div>
			<div class="wrong_box">
				{item.result === 'wrong' ? `정답 : ${item.answer}번` : ''}
			</div>
		</div>
	{/each}
	<div class="move_top_box">
		<div class="move_top_inner_box" on:click={toTop}>
			<img src="/imgs/icon_top.svg" alt="상단이동" />
			<span>상단으로 가기</span>
		</div>
	</div>
</main>

<style>
	div {
		font-family: 'ChosunCentennial', sans-serif;
	}
	.info_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 5rem;
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
	.info_date {
		padding-top: 2rem;
		font-size: 2rem;
		color: var(--main-bg-gray);
	}
	.result_box {
		display: flex;
		flex-direction: column;
	}
	.result_box div {
		display: flex;
		justify-content: center;
		width: 100%;
		font-size: 2rem;
		font-family: 'Pretendard', sans-serif;
	}
	.result_box_01 {
		border-top: 2px solid var(--main-bg-gray);
		border-left: 2px solid var(--main-bg-gray);
		padding: 2rem;
		font-weight: 700;
	}
	.result_box_02 {
		border-top: 2px solid var(--main-bg-gray);
		border-left: 2px solid var(--main-bg-gray);
		padding: 2rem;
		font-weight: 700;
	}
	.result_box_03 {
		border-top: 2px solid var(--main-bg-gray);
		border-left: 2px solid var(--main-bg-gray);
		border-right: 2px solid var(--main-bg-gray);
		padding: 2rem;
		font-weight: 700;
	}
	.result_box_04 {
		border-top: 2px solid var(--main-bg-gray);
		border-left: 2px solid var(--main-bg-gray);
		border-bottom: 2px solid var(--main-bg-gray);
		padding: 2rem;
	}
	.result_box_05 {
		border-top: 2px solid var(--main-bg-gray);
		border-left: 2px solid var(--main-bg-gray);
		border-bottom: 2px solid var(--main-bg-gray);
		padding: 2rem;
	}
	.result_box_06 {
		border-top: 2px solid var(--main-bg-gray);
		border-left: 2px solid var(--main-bg-gray);
		border-right: 2px solid var(--main-bg-gray);
		border-bottom: 2px solid var(--main-bg-gray);
		padding: 2rem;
	}

	.admin_message_box {
		display: flex;
		justify-content: center;
		padding: 5rem;
		font-size: 2rem;
		font-weight: 700;
		font-family: 'Pretendard', sans-serif;
		color: var(--main-bg-gray);
	}

	.middle_box {
		padding: 5rem;
		border-bottom: 2px solid var(--main-bg-gray);
	}

	.feedback_box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding-top: 4rem;
	}
	.feedback_box input {
		width: 100%;
		height: 50px;
		padding: 0 0 0 1rem;
		font-size: 1.6rem;
		border: 1px solid var(--main-bg-gray);
	}
	.feedback_box input:focus {
		outline: none;
		border: 1px solid var(--main-bg-purple);
	}
	.feedback_box button {
		width: 30%;
		height: 50px;
		margin-top: 1rem;
		font-size: 1.6rem;
		font-weight: 700;
		color: white;
		background-color: var(--main-bg-purple);
		border: none;
		cursor: pointer;
		border-radius: 4px;
	}

	.main_logo_box {
		display: flex;
		justify-content: center;
	}
	.main_logo_inner_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}
	.main_logo_inner_box:hover {
		color: var(--main-bg-purple);
	}
	.main_logo_inner_box span {
		font-size: 2rem;
		font-weight: 700;
	}
	.main_icon_box {
		display: flex;
		justify-content: center;
		align-items: center;
		padding-top: 4rem;
	}
	.main_link_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 4rem;
		cursor: pointer;
	}
	.main_reset_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 4rem;
		cursor: pointer;
	}
	.main_link_box img {
		width: 50px;
	}
	.main_link_box p {
		font-size: 1.6rem;
		font-weight: 700;
		padding-top: 1rem;
	}
	.main_reset_box img {
		width: 50px;
	}
	.main_reset_box p {
		font-size: 1.6rem;
		font-weight: 700;
		padding-top: 1rem;
	}
	.main_link_box:hover {
		color: var(--main-bg-purple);
	}
	.main_reset_box:hover {
		color: var(--main-bg-purple);
	}

	.question_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 4rem;
	}
	.test_box {
		padding-top: 5rem;
	}
	.question {
		position: relative;
		font-size: 2.2rem;
		padding-bottom: 2rem;
	}
	.question img {
		position: absolute;
		top: -2rem;
		left: -2rem;
		width: 6rem;
		opacity: 0.6;
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
	}
	.answer_class {
		font-weight: 700;
	}

	.move_top_box {
		display: flex;
		justify-content: center;
		padding: 5rem;
	}
	.move_top_inner_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}
	.move_top_inner_box img {
		width: 60px;
	}
	.move_top_inner_box span {
		font-size: 1.4rem;
		font-weight: 700;
		padding-top: 1rem;
	}
	.move_top_inner_box:hover {
		color: var(--main-bg-purple);
	}

	.wrong_box {
		padding: 1rem;
		font-size: 2rem;
		color: var(--main-bg-gray);
	}

	@media (max-width: 768px) {
		.info_box {
			padding: 2rem 0.5rem;
		}
		.info_title {
			font-size: 2rem;
		}
		.info_username {
			padding-top: 1rem;
			font-size: 1.4rem;
		}
		.info_date {
			padding-top: 1rem;
			font-size: 1.4rem;
		}
		.result_box div {
			font-size: 1.2rem;
		}
		.result_box_01 {
			padding: 1rem;
		}
		.result_box_02 {
			padding: 1rem;
		}
		.result_box_03 {
			padding: 1rem;
		}
		.result_box_04 {
			padding: 1rem;
		}
		.result_box_05 {
			padding: 1rem;
		}
		.result_box_06 {
			padding: 1rem;
		}
		.question img {
			top: -1rem;
			left: 0;
		}
	}
</style>
