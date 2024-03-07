<script>
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { showToast } from '$lib/util/alerts'
	import { storeTestData } from '$lib/store/store.js'

	export let data

	const items = data.props.abilityTestItems
	const sessionData = data.props.abilityTest
	let username = ''
	$: $storeTestData

	onMount(() => {
		sessionStorage.setItem('testItems', JSON.stringify(sessionData))
	})

	storeTestData.set(items)

	function sweetToast(title, icon) {
		showToast({
			title: title,
			icon: icon
		})
	}

	// Supabase 스토리지의 베이스 URL
	const baseUrl = 'https://aqnmhrbebgwoziqtyyns.supabase.co/storage/v1/object/public/'

	// 이미지의 전체 URL을 계산하는 함수
	function getImageUrl(imgUrl) {
		return `${baseUrl}${imgUrl}`
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			start()
		}
	}

	async function start() {
		if (username === '') {
			sweetToast('이름을 입력해 주세요.', 'warning')
			return
		}

		sessionStorage.setItem('test_username', username)
		await goto(`/abilitytest/start/?${username}`)
	}
</script>

<main>
	<div>
		<span class="span_01">
			{sessionData.title}
		</span>
	</div>
	<div class="text_box_02">
		<span class="span_02">
			{sessionData.sub_title}
		</span>
	</div>
	<div class="img_box">
		<img src={getImageUrl(sessionData.img_url)} alt={data.title} />
	</div>

	<div class="text_box_03">
		<span class="span_03">
			{sessionData.description}
		</span>
	</div>

	<div>
		<input
			type="text"
			placeholder="이름을 입력해주세요"
			bind:value={username}
			on:keydown={handleKeydown}
		/>
	</div>
	<div>
		<button class={username.length > 0 ? 'ok' : 'no'} on:click={start}>시작하기</button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 560px;
		margin: 0 auto;
	}
	.span_01 {
		font-size: 4rem;
		font-weight: 700;
	}
	.span_02 {
		font-size: 2rem;
		color: var(--secondary-color);
	}
	.span_03 {
		font-size: 2rem;
	}
	.text_box_02 {
		margin: 2rem 0;
	}
	.text_box_03 {
		margin: 2rem 0;
	}
	input {
		margin: 2rem 0;
		border: 1px solid var(--secondary-color);
		outline: none;
		padding: 1rem 10rem;
		box-sizing: border-box;
		text-align: center;
	}
	input:focus {
		border-color: var(--main-bg-yellow);
		outline: none;
	}
	button {
		margin: 1rem 0;
		padding: 1rem 16.5rem;
		border: none;
		border-radius: 4px;
		color: var(--main-bg-white);
		cursor: pointer;
	}
	.ok {
		background-color: var(--main-bg-gray);
	}
	.no {
		background-color: var(--main-bg-lightGray);
	}

	@media (max-width: 768px) {
		.span_01 {
			font-size: 3rem;
		}
		.span_02 {
			font-size: 1.5rem;
		}
		.span_03 {
			font-size: 1.5rem;
		}
		.img_box {
			display: flex;
			justify-content: center;
		}
		img {
			width: 90%;
		}
		input {
			padding: 1rem 5rem;
		}
		button {
			padding: 1rem 11.5rem;
		}
	}
</style>
