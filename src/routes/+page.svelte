<script>
	import { goto } from '$app/navigation'

	export let data

	const items = data.props.combinedData

	// Supabase 스토리지의 베이스 URL
	const baseUrl = 'https://aqnmhrbebgwoziqtyyns.supabase.co/storage/v1/object/public/'

	// 이미지의 전체 URL을 계산하는 함수
	function getImageUrl(imgUrl) {
		return `${baseUrl}${imgUrl}`
	}

	function simpleHash(str) {
		let hash = 0
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash
		}
		return hash
	}

	function setItems(data) {
		const hashedCategory = simpleHash(data.category).toString()
		sessionStorage.setItem('testItems', JSON.stringify(data))

		if (data.category === '능력고사') {
			sessionStorage.setItem('test_id', data.id)
			sessionStorage.setItem('test_category', hashedCategory)
			goto(`/abilitytest/${data.id}?category=${hashedCategory}`)
		} else if (data.category === 'MBTI') {
			goto(`/mbtitest/${data.id}?category=${data.category}`)
		}
	}
</script>

<main>
	<div class="main_logo_box">
		<img src="/imgs/main-logo-text.png" alt="로고" />
	</div>
	<div class="item_box">
		{#each items as data}
			<div
				class="item"
				on:click={() => {
					setItems(data)
				}}
			>
				<div class="item_img_box">
					<img src={getImageUrl(data.img_url)} alt={data.title} />
				</div>
				<div class="item_text_box">
					<p class="item_p1">{data.title}</p>
					<p class="item_p2">{data.sub_title}</p>
				</div>
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 560px;
		margin: 0 auto;
		font-family: 'Pretendard', sans-serif;
	}
	.main_logo_box {
		margin-bottom: 50px;
	}
	.item_box {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		width: 100%;
		padding: 0 var(--padding-standard);
	}
	.item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: calc(50% - var(--padding-standard));
		height: 200px;
		background-color: #f0f0f0;
		margin-top: 10px;
		margin-bottom: 100px;
		margin-right: var(--padding-standard);
		border-radius: 10px;
		cursor: pointer;
		text-align: center;
	}
	.item_img_box {
		width: 100%;
		height: 200px;
	}
	.item_text_box {
	}
	.item img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: 10px;
	}
	.item_p1 {
		margin-top: 10px;
		font-size: 1.8rem;
		font-weight: 600;
		color: var(--main-bg-dark);
	}
	.item_p2 {
		margin-top: 10px;
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--secondary-color);
	}
	.item:nth-child(2n) {
		margin-right: 0;
	}

	@media (max-width: 768px) {
		.item_img_box {
			height: 200px;
		}
		.item {
			width: 100%;
			margin-right: 0;
		}
	}
</style>
