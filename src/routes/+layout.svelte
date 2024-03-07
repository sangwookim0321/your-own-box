<script>
	import { onMount } from 'svelte'

	let showSubMenu = false

	function toggleSubMenu() {
		showSubMenu = !showSubMenu
	}
</script>

<main>
	<div class="layout">
		<header>
			<div class="hamburger" on:click={toggleSubMenu}>
				<img src="/imgs/icon_menu.svg" alt="메뉴" />
				{#if showSubMenu}
					<div class="submenu">
						<ul>
							<li>Item 1</li>
							<li>Item 2</li>
							<li>Item 3</li>
						</ul>
					</div>
				{/if}
			</div>
		</header>
		<div class="content">
			<slot />
		</div>
		<footer>
			<div class="footer_text">Made by Hardy</div>
			<div class="footer_text">pointjumpit@gmail.com</div>
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
		justify-content: flex-end;
		width: 100%;
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
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 1rem;
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
