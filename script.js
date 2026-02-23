document.addEventListener('DOMContentLoaded', function () {

    // 1. HEADER SCROLL
    var header = document.getElementById('header');
    function handleScroll() {
        header.classList.toggle('header-scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 2. MOBILE MENU
    var menuBtn = document.getElementById('mobile-menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    var mobileLinks = document.querySelectorAll('.mobile-nav-link');
    var menuOpen = false;
    function toggleMenu() {
        menuOpen = !menuOpen;
        menuBtn.classList.toggle('menu-open', menuOpen);
        mobileMenu.classList.toggle('open', menuOpen);
        document.body.classList.toggle('menu-locked', menuOpen);
        menuBtn.setAttribute('aria-expanded', String(menuOpen));
    }
    function closeMenu() {
        if (!menuOpen) return;
        menuOpen = false;
        menuBtn.classList.remove('menu-open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-locked');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
    menuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(function (l) { l.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(); });

    // 3. SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            var id = this.getAttribute('href');
            if (id === '#') return;
            var el = document.querySelector(id);
            if (el) {
                var offset = header.offsetHeight + 16;
                window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
            }
        });
    });

    // 4. ACCORDION
    var acc = document.getElementById('accordion-container');
    if (acc) {
        var items = acc.querySelectorAll('.accordion-item');
        items.forEach(function (item) {
            item.querySelector('.accordion-trigger').addEventListener('click', function () {
                var isOpen = item.classList.contains('open');
                items.forEach(function (o) { if (o !== item) o.classList.remove('open'); });
                item.classList.toggle('open', !isOpen);
            });
        });
    }

    // 5. PARALLAX HERO
    var heroParallax = document.getElementById('hero-parallax');
    if (heroParallax && window.innerWidth >= 768) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    var scrolled = window.scrollY;
                    if (scrolled < window.innerHeight) {
                        heroParallax.style.transform = 'translateY(' + (scrolled * 0.35) + 'px)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // 6. ANIMATED COUNTERS
    var counters = document.querySelectorAll('.counter');
    var counterAnimated = false;
    function animateCounters() {
        if (counterAnimated) return;
        counters.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                counterAnimated = true;
                var target = parseInt(el.getAttribute('data-target'), 10);
                var duration = 2000;
                var start = 0;
                var startTime = null;
                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    var progress = Math.min((timestamp - startTime) / duration, 1);
                    // Ease out cubic
                    var eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target);
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target;
                    }
                }
                requestAnimationFrame(step);
            }
        });
    }
    if (counters.length) {
        window.addEventListener('scroll', animateCounters, { passive: true });
        animateCounters(); // check immediately
    }

    // 7. FLOATING CTA (mobile)
    var floatingCta = document.getElementById('floating-cta');
    if (floatingCta) {
        var heroSection = document.getElementById('hero');
        var contactSection = document.getElementById('contact');
        function checkFloatingCta() {
            if (window.innerWidth >= 1024) {
                floatingCta.classList.remove('visible');
                return;
            }
            var scrollY = window.scrollY;
            var heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 600;
            var contactTop = contactSection ? contactSection.offsetTop - window.innerHeight : Infinity;
            if (scrollY > heroBottom && scrollY < contactTop) {
                floatingCta.classList.add('visible');
            } else {
                floatingCta.classList.remove('visible');
            }
        }
        window.addEventListener('scroll', checkFloatingCta, { passive: true });
        window.addEventListener('resize', checkFloatingCta);
        checkFloatingCta();
    }

    // 8. CALENDLY CALENDAR
    var calDays = document.getElementById('calendar-days');
    var monthLabel = document.getElementById('cal-month-label');
    var prevBtn = document.getElementById('cal-prev');
    var nextBtn = document.getElementById('cal-next');
    var timeSlotsBox = document.getElementById('time-slots-container');
    var timeSlotsEl = document.getElementById('time-slots');
    var dateLabel = document.getElementById('selected-date-label');

    if (calDays && monthLabel) {
        var MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
        var DAYS_SHORT = ['lun.','mar.','mer.','jeu.','ven.','sam.','dim.'];
        var SLOTS = ['9:00','9:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];
        var today = new Date();
        var curMonth = today.getMonth();
        var curYear = today.getFullYear();
        var selectedDate = null;

        function isAvail(d) {
            var day = d.getDay();
            var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return day !== 0 && day !== 6 && d >= todayStart;
        }
        function render() {
            calDays.innerHTML = '';
            monthLabel.textContent = MONTHS[curMonth] + ' ' + curYear;
            var first = new Date(curYear, curMonth, 1);
            var start = first.getDay(); start = start === 0 ? 6 : start - 1;
            var daysIn = new Date(curYear, curMonth + 1, 0).getDate();
            for (var i = 0; i < start; i++) { var e = document.createElement('div'); e.className = 'p-0.5'; calDays.appendChild(e); }
            for (var day = 1; day <= daysIn; day++) {
                var date = new Date(curYear, curMonth, day);
                var cell = document.createElement('div'); cell.className = 'p-0.5';
                var span = document.createElement('span'); span.className = 'cal-day'; span.textContent = day;
                if (date.toDateString() === today.toDateString()) span.classList.add('today');
                if (isAvail(date)) { span.classList.add('available'); (function(d,s){ s.addEventListener('click', function(){ selectDate(d,s); }); })(date, span); }
                else { span.classList.add('disabled'); }
                if (selectedDate && date.toDateString() === selectedDate.toDateString()) span.classList.add('selected');
                cell.appendChild(span); calDays.appendChild(cell);
            }
        }
        function selectDate(date, el) {
            selectedDate = date;
            calDays.querySelectorAll('.cal-day').forEach(function(d){ d.classList.remove('selected'); });
            el.classList.add('selected');
            var di = date.getDay() === 0 ? 6 : date.getDay() - 1;
            dateLabel.textContent = DAYS_SHORT[di] + ' ' + date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear();
            var seed = date.getDate() + date.getMonth() * 31;
            var avail = SLOTS.filter(function(_, i) { return ((seed * 7 + i * 13) % 5) !== 0; });
            timeSlotsEl.innerHTML = '';
            avail.forEach(function(time) {
                var btn = document.createElement('button'); btn.className = 'time-slot'; btn.textContent = time;
                btn.addEventListener('click', function() { timeSlotsEl.querySelectorAll('.time-slot').forEach(function(s){ s.classList.remove('selected'); }); btn.classList.add('selected'); });
                timeSlotsEl.appendChild(btn);
            });
            timeSlotsBox.classList.remove('hidden');
            if (window.innerWidth < 1024) { setTimeout(function(){ timeSlotsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100); }
        }
        prevBtn.addEventListener('click', function() { curMonth--; if (curMonth < 0) { curMonth = 11; curYear--; } render(); });
        nextBtn.addEventListener('click', function() { curMonth++; if (curMonth > 11) { curMonth = 0; curYear++; } render(); });
        render();
    }

    // 9. SCROLL REVEAL
    if (typeof ScrollReveal !== 'undefined') {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduced) {
            var sr = ScrollReveal({ distance: '40px', duration: 900, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)', reset: false, delay: 100, mobile: true, viewFactor: 0.15 });
            sr.reveal('.reveal-up', { origin: 'bottom', distance: '30px' });
            sr.reveal('.reveal-left', { origin: 'left', distance: '60px' });
            sr.reveal('.reveal-right', { origin: 'right', distance: '60px' });
            sr.reveal('.reveal-card', { origin: 'bottom', distance: '30px', interval: 120 });
            sr.reveal('.reveal-faq', { origin: 'bottom', distance: '20px', interval: 80 });
        }
    }

});
