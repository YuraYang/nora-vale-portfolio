/* ============================================================
   温 研 — 交互脚本
   页面切换 / 主题 / 灯箱 / 实时校验 / 本地时间 / 自定义光标
   ============================================================ */
(function () {
	"use strict";

	const root = document.documentElement;
	let lastScroll = 0;
	// 需要随滚动渐隐的“底部小字”
	const fadeEls = document.querySelectorAll(".reveal, .scroll-hint");

	/* ---------- 主题 ---------- */
	const saved = localStorage.getItem("theme");
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	root.classList.toggle("dark", saved ? saved === "dark" : prefersDark);

	document.getElementById("themeToggle").addEventListener("click", () => {
		const dark = root.classList.toggle("dark");
		localStorage.setItem("theme", dark ? "dark" : "light");
	});

	/* ---------- 页面切换（点击式） ---------- */
	const navLinks = document.querySelectorAll("[data-page]");
	const pages = document.querySelectorAll(".page");

	function goPage(index) {
		const i = String(index);
		pages.forEach((p) => p.classList.toggle("active", p.dataset.page === i));
		navLinks.forEach((a) => a.classList.toggle("current", a.dataset.page === i));
		const active = document.querySelector(".page.active");
		if (active) active.scrollTop = 0;
		fadeEls.forEach((el) => el.classList.remove("faded"));
		lastScroll = 0;
		closeMenu();
	}

	navLinks.forEach((a) => {
		a.addEventListener("click", (e) => {
			e.preventDefault();
			goPage(a.dataset.page);
		});
	});

	/* 键盘左右切换页面 */
	document.addEventListener("keydown", (e) => {
		if (document.getElementById("lightbox").hasAttribute("hidden") === false) return;
		const current = [...pages].findIndex((p) => p.classList.contains("active"));
		if (e.key === "ArrowRight") goPage(Math.min(current + 1, pages.length - 1));
		if (e.key === "ArrowLeft") goPage(Math.max(current - 1, 0));
	});

	/* ---------- 底部小字：滑动时逐渐淡出 ---------- */
	document.querySelectorAll(".page").forEach((page) => {
		page.addEventListener(
			"scroll",
			() => {
				const st = page.scrollTop;
				const atTop = st < 8;
				const atBottom = st + page.clientHeight >= page.scrollHeight - 8;
				const scrollingDown = st > lastScroll && st > 40;
				fadeEls.forEach((el) => {
					if (atTop || atBottom || st < lastScroll) {
						el.classList.remove("faded"); // 顶部/底部/向上滑 -> 淡入
					} else if (scrollingDown) {
						el.classList.add("faded"); // 向下滑 -> 逐渐消失
					}
				});
				lastScroll = st;
			},
			{ passive: true }
		);
	});

	/* ---------- 移动端菜单 ---------- */
	const menuBtn = document.getElementById("menuBtn");
	const nav = document.getElementById("nav");
	function closeMenu() {
		nav.classList.remove("open");
		menuBtn.setAttribute("aria-expanded", "false");
	}
	menuBtn.addEventListener("click", () => {
		const open = nav.classList.toggle("open");
		menuBtn.setAttribute("aria-expanded", String(open));
	});

	/* ---------- 跑马灯无缝循环 ---------- */
	const marquee = document.getElementById("marquee");
	if (marquee) marquee.innerHTML += marquee.innerHTML;

	/* ---------- 作品筛选 ---------- */
	const chips = document.querySelectorAll("#filters .chip");
	const projects = document.querySelectorAll("#grid .project");
	const gridEmpty = document.getElementById("gridEmpty");

	chips.forEach((chip) => {
		chip.addEventListener("click", () => {
			chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
			chip.setAttribute("aria-pressed", "true");
			const filter = chip.dataset.filter;
			let visible = 0;
			projects.forEach((p) => {
				const show = filter === "all" || p.dataset.type === filter;
				p.classList.toggle("is-hidden", !show);
				if (show) visible++;
			});
			gridEmpty.hidden = visible !== 0;
		});
	});

	/* ---------- 作品数据（灯箱复用） ---------- */
	const projectData = [
		{ title: "须知", tags: "长按打开链接", meta: "https://www.kdocs.cn/l/cdBS5E2xKF70", url: "https://www.kdocs.cn/l/cdBS5E2xKF70" },
		{ title: "话术", tags: "想親口告訴你個秘密 先親口再說", meta: "https://www.kdocs.cn/l/colx9iFlSC1F", url: "https://www.kdocs.cn/l/colx9iFlSC1F" },
		{ title: "板评", tags: "無論我再怎麼使壞 你都不能離開我", meta: "https://www.kdocs.cn/l/cq8gG1q46dxI", url: "https://www.kdocs.cn/l/cq8gG1q46dxI" },
		{ title: "冠卡", tags: "你的啃咬不過是我允許的撒嬌", meta: "暂未整理合集 多数在pyq", url: null },
		{ title: "头牌", tags: "你真不覺得自己有趣嗎 我的眼睛都離不開你", meta: "https://www.kdocs.cn/l/csaX8j2X6dxb", url: "https://www.kdocs.cn/l/csaX8j2X6dxb" },
		{ title: "自介", tags: "我保留一次你親我的權利", meta: "https://www.kdocs.cn/l/crOmRGs4TVer", url: "https://www.kdocs.cn/l/crOmRGs4TVer" },
	];

	/* ---------- 灯箱 ---------- */
	const lightbox = document.getElementById("lightbox");
	const lbCover = document.getElementById("lbCover");
	const lbTitle = document.getElementById("lbTitle");
	const lbCaption = document.getElementById("lbCaption");
	const lbMeta = document.getElementById("lbMeta");
	let currentIndex = 0;

	function openLightbox(index) {
		currentIndex = index;
		const data = projectData[index];
		lbCover.className = "lb-cover cover cover-" + index;
		lbTitle.textContent = data.title;
		lbCaption.textContent = data.tags;
		if (data.url) {
			lbMeta.innerHTML =
				'<a href="' + data.url + '" target="_blank" rel="noopener">' + data.meta + "</a>";
		} else {
			lbMeta.textContent = data.meta;
		}
		lightbox.hidden = false;
		document.body.style.overflow = "hidden";
	}
	function closeLightbox() {
		lightbox.hidden = true;
		document.body.style.overflow = "";
	}
	function step(dir) {
		currentIndex = (currentIndex + dir + projectData.length) % projectData.length;
		openLightbox(currentIndex);
	}

	document.querySelectorAll(".project-btn").forEach((btn) => {
		btn.addEventListener("click", () => openLightbox(Number(btn.dataset.index)));
	});
	lbCover.addEventListener("click", () => {
		const url = projectData[currentIndex].url;
		if (url) window.open(url, "_blank", "noopener");
	});
	document.getElementById("lbClose").addEventListener("click", closeLightbox);
	document.getElementById("lbPrev").addEventListener("click", () => step(-1));
	document.getElementById("lbNext").addEventListener("click", () => step(1));
	lightbox.addEventListener("click", (e) => {
		if (e.target === lightbox) closeLightbox();
	});
	document.addEventListener("keydown", (e) => {
		if (lightbox.hidden) return;
		if (e.key === "Escape") closeLightbox();
		if (e.key === "ArrowLeft") step(-1);
		if (e.key === "ArrowRight") step(1);
	});

	/* ---------- Toast ---------- */
	const toast = document.getElementById("toast");
	let toastTimer;
	function showToast(msg) {
		toast.textContent = msg;
		toast.classList.add("show");
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
	}

	/* ---------- 复制邮箱 ---------- */
	const copyMail = document.getElementById("copyMail");
	if (copyMail) {
		copyMail.addEventListener("click", (e) => {
			e.preventDefault();
			const email = copyMail.dataset.email;
			navigator.clipboard?.writeText(email).then(
				() => showToast("已复制 " + email + " 到剪贴板"),
				() => showToast("邮箱：" + email)
			);
		});
	}

	/* ---------- 表单实时校验 ---------- */
	const form = document.getElementById("contactForm");
	const fields = {
		name: { el: document.getElementById("name"), hint: document.getElementById("nameHint"), test: (v) => v.trim().length >= 2, ok: "看起来不错", bad: "至少 2 个字符" },
		email: { el: document.getElementById("email"), hint: document.getElementById("emailHint"), test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), ok: "可以联系到你", bad: "邮箱格式不正确" },
		message: { el: document.getElementById("message"), hint: document.getElementById("messageHint"), test: (v) => v.trim().length >= 20, ok: "描述得很清楚", bad: "再多写一点（≥20 字）" },
	};

	function validate(key, showOk) {
		const f = fields[key];
		const val = f.el.value;
		const wrap = f.el.closest(".field");
		if (val === "") {
			wrap.classList.remove("valid", "invalid");
			f.hint.textContent = "";
			return false;
		}
		const pass = f.test(val);
		wrap.classList.toggle("valid", pass);
		wrap.classList.toggle("invalid", !pass);
		f.hint.textContent = pass ? (showOk ? f.ok : "") : f.bad;
		return pass;
	}

	Object.keys(fields).forEach((key) => {
		const f = fields[key];
		f.el.addEventListener("input", () => validate(key, false));
		f.el.addEventListener("blur", () => validate(key, true));
	});

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const allValid = Object.keys(fields).map((k) => validate(k, true)).every(Boolean);
		if (allValid) {
			showToast("消息已发送，我会尽快回复你 →");
			form.reset();
			Object.values(fields).forEach((f) => f.el.closest(".field").classList.remove("valid", "invalid"));
		} else {
			showToast("请检查标红的字段");
		}
	});

	/* ---------- 本地时间 ---------- */
	const clock = document.getElementById("clock");
	function tick() {
		const now = new Date();
		const t = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
		clock.textContent = "Local time " + t;
	}
	tick();
	setInterval(tick, 1000);

	/* ---------- 自定义光标 ---------- */
	const cursor = document.getElementById("cursor");
	if (window.matchMedia("(hover: hover)").matches) {
		document.addEventListener("mousemove", (e) => {
			cursor.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px) translate(-50%,-50%)";
		});
		document.querySelectorAll("a, button").forEach((el) => {
			el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
			el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
		});
	}
})();
