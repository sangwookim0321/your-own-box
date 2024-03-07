<script>
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores.js'

	let showSubMenu = false
	let currentPath = ''

	$: currentPath = $page.url.pathname
	$: console.log(currentPath)

	function toggleSubMenu() {
		showSubMenu = !showSubMenu
	}

	async function goHome() {
		// 홈으로 이동
		await goto('/')
	}
</script>

<main>
	<div class="layout">
		<header class={currentPath === '/' ? 'header_end' : 'header_between'}>
			{#if currentPath !== '/'}
				<div class="header_logo" on:click={goHome}>
					<img src="/imgs/main-logo-128.png" alt="main-logo" />
				</div>
			{/if}
			<div class="hamburger" on:click={toggleSubMenu}>
				<img src="/imgs/icon_menu.svg" alt="메뉴" />
				{#if showSubMenu}
					<div class="submenu">
						<ul>
							<li></li>
						</ul>
					</div>
				{/if}
			</div>
		</header>
		<div class="content">
			<slot />
		</div>
		<footer>
			<div class="footer_logo_box">
				<img src="/imgs/main-logo-128.png" alt="main-logo" />
			</div>
			<div class="footer_text_box">
				<div class="footer_text">Made by Hardy</div>
				<div class="footer_text">pointjumpit@gmail.com</div>
			</div>
		</footer>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		min-height: 100vh;
		background-color: rgb(248, 248, 248);
	}
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
	}
	header {
		padding: 1rem;
		display: flex;
		align-items: center;
		width: 100%;
		height: 20px;
	}
	.header_end {
		justify-content: flex-end;
	}
	.header_between {
		justify-content: space-between;
	}
	.header_logo img {
		width: 50px;
		height: 50px;
		cursor: pointer;
	}
	.layout {
		display: flex;
		flex-direction: column;
		max-width: 560px;
		width: 100%;
		min-height: 100vh;
	}
	.content {
		margin: 0 auto;
		padding: 1rem;
		flex-grow: 1;
		width: 100%;
	}
	.hamburger {
		cursor: pointer;
		position: relative;
	}
	footer {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 1rem;
	}
	.footer_logo_box img {
		width: 6rem;
	}
	.footer_text {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--main-bg-dark);
	}
	.submenu {
		position: absolute;
		top: 40px;
		right: 0;
		background-color: white;
		border: 1px solid #ccc;
		width: max-content;
		animation: slideDown 0.3s ease-out forwards;
	}
	.submenu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.submenu ul li {
		padding: 10px;
		border-bottom: 1px solid #eee;
	}
	.submenu ul li:last-child {
		border-bottom: none;
	}
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
