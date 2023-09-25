--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.3 (Ubuntu 15.3-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: nomad; Owner: sys_admin
--

COPY nomad.users (id, usr_first_name, usr_last_name, usr_email, usr_valid, usr_ucre_id, usr_umod_id, usr_dcre, usr_dmod, usr_configuration, usr_status, usr_company) FROM stdin;
1	ahmed	ayed	ahmed.ayed.ext@veolia.com	t	0	0	2023-07-13 07:33:08.778033	2023-07-13 07:33:08.778033	\N	interne	\N
3	alexandre	berriau	alexandre.berriau.ext@veolia.com	t	0	0	2023-07-13 07:35:08.628326	2023-07-13 07:35:08.628326	\N	interne	\N
5	baptiste	mohaer	baptiste.mohaer.ext@veolia.com	t	0	0	2023-07-13 07:35:08.630422	2023-07-13 07:35:08.630422	\N	interne	\N
7	frederic	rossard	frederic.rossard-ext@veolia.com	t	0	0	2023-07-13 07:35:08.632526	2023-07-13 07:35:08.632526	\N	interne	\N
8	kamardine	youssoufa	kamardine.youssoufa@veolia.com	t	0	0	2023-07-13 07:35:08.633725	2023-07-13 07:35:08.633725	\N	interne	\N
9	said	maisse	said.maisse.ext@veolia.com	t	0	0	2023-07-13 07:35:08.634777	2023-07-13 07:35:08.634777	\N	interne	\N
10	samir	kalloubi	samir.kalloubi@veolia.com	t	0	0	2023-07-13 07:35:08.635724	2023-07-13 07:35:08.635724	\N	interne	\N
12	hocine	mendaci	hocine.mendaci@veolia.com	t	0	0	2023-07-13 07:35:08.637382	2023-07-13 07:35:08.637382	\N	interne	\N
13	sebastien	esnault	sebastien.esnault@veolia.com	t	0	0	2023-07-13 07:35:08.63846	2023-07-13 07:35:08.63846	\N	interne	\N
14	adel	benhamidat	adel.benhamidat@veolia.com	t	0	0	2023-07-13 07:35:08.639265	2023-07-13 07:35:08.639265	\N	interne	\N
15	aurelie	verbrugghe	aurelie.verbrugghe@veolia.com	t	0	0	2023-07-13 07:35:08.640105	2023-07-13 07:35:08.640105	\N	interne	\N
16	dany	ledortz	dany.ledortz@veolia.com	t	0	0	2023-07-13 07:35:08.640926	2023-07-13 07:35:08.640926	\N	interne	\N
17	fabien	charlot	fabien.charlot@veolia.com	t	0	0	2023-07-13 07:35:08.641829	2023-07-13 07:35:08.641829	\N	interne	\N
18	johan	ducarteron	johan.ducarteron@veolia.com	t	0	0	2023-07-13 07:35:08.642853	2023-07-13 07:35:08.642853	\N	interne	\N
19	kevin	couesnon	kevin.couesnon@veolia.com	t	0	0	2023-07-13 07:35:08.643607	2023-07-13 07:35:08.643607	\N	interne	\N
20	loic	pinot	loic.pinot@veolia.com	t	0	0	2023-07-13 07:35:08.644531	2023-07-13 07:35:08.644531	\N	interne	\N
21	ludovic	rouault	ludovic.rouault@veolia.com	t	0	0	2023-07-13 07:35:08.64543	2023-07-13 07:35:08.64543	\N	interne	\N
22	mamoudou	diallo	mamoudou.diallo@veolia.com	t	0	0	2023-07-13 07:35:08.646443	2023-07-13 07:35:08.646443	\N	interne	\N
23	morgane	lejouan	morgane.lejouan@veolia.com	t	0	0	2023-07-13 07:35:08.647245	2023-07-13 07:35:08.647245	\N	interne	\N
24	pascal	barbe	pascal.barbe@veolia.com	t	0	0	2023-07-13 07:35:08.648223	2023-07-13 07:35:08.648223	\N	interne	\N
25	romain	lampach	romain.lampach@veolia.com	t	0	0	2023-07-13 07:35:08.649039	2023-07-13 07:35:08.649039	\N	interne	\N
26	victor	ntsame-bengone	victor.ntsame-bengone@veolia.com	t	0	0	2023-07-13 07:35:08.649901	2023-07-13 07:35:08.649901	\N	interne	\N
27	vincent	parez	vincent.parez@veolia.com	t	0	0	2023-07-13 07:35:08.650685	2023-07-13 07:35:08.650685	\N	interne	\N
28	xavier	salomon	xavier.salomon@veolia.com	t	0	0	2023-07-13 07:35:08.651548	2023-07-13 07:35:08.651548	\N	interne	\N
29	ousseynou	ndoye	ousseynou.ndoye@veolia.com	t	0	0	2023-07-13 07:35:08.652382	2023-07-13 07:35:08.652382	\N	interne	\N
31	emilie	pislor	emilie.pislor@veolia.com	t	0	0	2023-07-13 07:35:08.654192	2023-07-13 07:35:08.654192	\N	interne	\N
32	morgane	guennec	morgane.guennec@veolia.com	t	0	0	2023-07-13 07:35:08.655068	2023-07-13 07:35:08.655068	\N	interne	\N
33	pierre	sartor	pierre.sartor@veolia.com	t	0	0	2023-07-13 07:35:08.655918	2023-07-13 07:35:08.655918	\N	interne	\N
34	germain	maubert	germain.maubert@veolia.com	t	0	0	2023-07-13 07:35:08.656937	2023-07-13 07:35:08.656937	\N	interne	\N
35	jean-philippe	hermant	jean-philippe.hermant@veolia.com	t	0	0	2023-07-13 07:35:08.657967	2023-07-13 07:35:08.657967	\N	interne	\N
36	romain	beugnet	romain.beugnet@veolia.com	t	0	0	2023-07-13 07:35:08.658819	2023-07-13 07:35:08.658819	\N	interne	\N
37	frederique	ulrich	frederique.ulrich@veolia.com	t	0	0	2023-07-13 07:35:08.659795	2023-07-13 07:35:08.659795	\N	interne	\N
38	francois-xavier	preys	francois-xavier.preys@veolia.com	t	0	0	2023-07-13 07:35:08.660775	2023-07-13 07:35:08.660775	\N	interne	\N
39	simon	wisniewski	simon.wisniewski@veolia.com	t	0	0	2023-07-13 07:35:08.661756	2023-07-13 07:35:08.661756	\N	interne	\N
40	mathieu	pebret	mathieu.pebret@veolia.com	t	0	0	2023-07-13 07:35:08.662678	2023-07-13 07:35:08.662678	\N	interne	\N
41	jerome	jeanneton	jerome.jeanneton@veolia.com	t	0	0	2023-07-13 07:35:08.663623	2023-07-13 07:35:08.663623	\N	interne	\N
42	didier	decorde	didier.decorde@eauxdemarseille.fr	t	0	0	2023-07-13 07:35:08.664609	2023-07-13 07:35:08.664609	\N	interne	\N
43	sylvain	sanchez	sylvain.sanchez@eauxdemarseille.fr	t	0	0	2023-07-13 07:35:08.665417	2023-07-13 07:35:08.665417	\N	interne	\N
44	germain	maubert	germain.maubert@eaudetm-eau.fr	t	0	0	2023-07-13 07:35:08.666406	2023-07-13 07:35:08.666406	\N	interne	\N
45	germain	maubert	germain.maubert@nomad.com	t	0	0	2023-07-13 07:35:08.66741	2023-07-13 07:35:08.66741	\N	interne	\N
46	anthony	ibanez	anthony.ibanez@veolia.com	t	0	0	2023-07-13 07:35:08.668373	2023-07-13 07:35:08.668373	\N	interne	\N
47	audrey	marqui	audrey.marqui@veolia.com	t	0	0	2023-07-13 07:35:08.669374	2023-07-13 07:35:08.669374	\N	interne	\N
48	cedric	deubelbeiss	cedric.deubelbeiss@veolia.com	t	0	0	2023-07-13 07:35:08.670412	2023-07-13 07:35:08.670412	\N	interne	\N
49	corinne	cyrot	corinne.cyrot@veolia.com	t	0	0	2023-07-13 07:35:08.671239	2023-07-13 07:35:08.671239	\N	interne	\N
50	damien	gysemans	damien.gysemans@veolia.com	t	0	0	2023-07-13 07:35:08.672255	2023-07-13 07:35:08.672255	\N	interne	\N
51	herve	serieys	herve.serieys@veolia.com	t	0	0	2023-07-13 07:35:08.673462	2023-07-13 07:35:08.673462	\N	interne	\N
52	kim	van-slaghmolen	kim.van-slaghmolen@veolia.com	t	0	0	2023-07-13 07:35:08.674535	2023-07-13 07:35:08.674535	\N	interne	\N
53	marc	dumas	marc.dumas@veolia.com	t	0	0	2023-07-13 07:35:08.675377	2023-07-13 07:35:08.675377	\N	interne	\N
54	mathieu	pinaud	mathieu.pinaud@veolia.com	t	0	0	2023-07-13 07:35:08.676272	2023-07-13 07:35:08.676272	\N	interne	\N
56	nicolas	modesto	nicolas.modesto@veolia.com	t	0	0	2023-07-13 07:35:08.677565	2023-07-13 07:35:08.677565	\N	interne	\N
58	pierre	truchi	pierre.truchi@veolia.com	t	0	0	2023-07-13 07:35:08.678846	2023-07-13 07:35:08.678846	\N	interne	\N
59	sylvie	rosis	sylvie.rosis@veolia.com	t	0	0	2023-07-13 07:35:08.679829	2023-07-13 07:35:08.679829	\N	interne	\N
6	even	soulard	even.soulard.ext@veolia.com	t	0	6	2023-07-13 07:35:08.631491	2023-07-19 16:36:02.085	{"favorites":[],"context":{"zoom":14,"lng":2.699596882916402,"lat":48.407854932986936,"url":"/home","layers":[]}}	interne	\N
4	anton	magnifique	anton.magnifique@veolia.com	t	0	4	2023-07-13 07:35:08.629598	2023-07-19 15:43:21.854	{"favorites":[],"context":{"zoom":15.499476566381517,"lng":2.701372049180236,"lat":48.405595222077665,"url":"/home","layers":[]}}	interne	\N
60	mhamed	benider	mhamed.benider.ext@veolia.com	t	0	0	2023-07-24 12:39:27.061342	2023-07-24 12:39:27.061342	\N	interne	\N
61	thierry	bonvarlet	thierry.bonvarlet@veolia.com	t	0	0	2023-07-24 12:39:35.978952	2023-07-24 12:39:35.978952	\N	interne	\N
62	sergine-magatte	dieye	sergine-magatte.dieye.ext@veolia.com	t	0	0	2023-07-24 12:39:35.980528	2023-07-24 12:39:35.980528	\N	interne	\N
11	sandrine	mvoudjo	sandrine.mvoudjo.ext@veolia.com	t	0	11	2023-07-13 07:35:08.636511	2023-07-19 11:39:30.959	{"favorites":[{"name":"Assainissement - favoris - 1","layers":[{"layerKey":"ass_collecteur"},{"layerKey":"ass_regard"}],"segment":"Reseau assainissement"},{"name":"Eau Potable - favoris - 2","layers":[{"layerKey":"aep_canalisation"}],"segment":"Reseau eau potable"}],"context":{"zoom":14,"lng":2.699596882916402,"lat":48.407854932986936,"url":"/home","layers":[]}}	interne	\N
64	morgane	bazillais	morgane.bazillais@veolia.com	t	0	0	2023-07-24 12:39:35.98334	2023-07-24 12:39:35.98334	\N	interne	\N
65	marie-amelie	bertin	marie-amelie.bertin.ext@veolia.com	t	0	0	2023-07-24 12:39:35.984616	2023-07-24 12:39:35.984616	\N	interne	\N
66	chloe	morin	chloe.morin@veolia.com	t	0	0	2023-07-25 15:53:17.350958	2023-07-25 15:53:17.350958	\N	interne	\N
67	mira	mahdi	mira.mahdi@veolia.com	t	0	0	2023-07-25 15:53:17.355413	2023-07-25 15:53:17.355413	\N	interne	\N
68	sherazade	derkaoui	sherazade.derkaoui@veolia.com	t	0	0	2023-07-25 15:53:17.356931	2023-07-25 15:53:17.356931	\N	interne	\N
69	olivier	ibanes	olivier.ibanes@veolia.com	t	0	0	2023-07-25 15:53:17.358424	2023-07-25 15:53:17.358424	\N	interne	\N
70	emilie	andre-pons	emilie.andre-pons@veolia.com	t	0	0	2023-07-25 15:53:17.360082	2023-07-25 15:53:17.360082	\N	interne	\N
71	julien	gossart	julien.gossart@veolia.com	t	0	0	2023-07-25 15:53:17.362489	2023-07-25 15:53:17.362489	\N	interne	\N
72	adrien	cosserat	adrien.cosserat@veolia.com	t	0	0	2023-07-25 15:53:17.366375	2023-07-25 15:53:17.366375	\N	interne	\N
73	florence	malet	florence.malet@runeo.re	t	0	0	2023-07-25 15:53:17.368192	2023-07-25 15:53:17.368192	\N	interne	\N
74	julien	lacour	julien.lacour@veolia.com	t	0	0	2023-07-25 15:53:18.208249	2023-07-25 15:53:18.208249	\N	interne	\N
75	pauline	dedise	pauline.dedise@veolia.com	t	0	0	2023-07-25 16:25:51.935397	2023-07-25 16:25:51.935397	\N	interne	\N
63	otman	marroun	otman.marroun.ext@veolia.com	t	0	63	2023-07-24 12:39:35.981872	2023-07-28 11:07:59.872	{"favorites":[],"context":{"zoom":14,"lng":2.699596882916402,"lat":48.407854932986936,"url":"/home","layers":[]}}	interne	\N
30	test	test	test@veolia.com	t	0	30	2023-07-13 07:35:08.653253	2023-07-31 09:23:22.911	{"favorites":[{"name":"Détails - favoris - 1","layers":[{"layerKey":"aep_branche"},{"layerKey":"aep_canalisation"},{"layerKey":"aep_vanne","styleKey":"AEP_VANNE_FERME_ELECTRO"},{"layerKey":"aep_vanne","styleKey":"AEP_VANNE_FERME_TOUR"},{"layerKey":"aep_vanne","styleKey":"AEP_VANNE_OUVERT_ELECTRO"},{"layerKey":"aep_vanne","styleKey":"AEP_VANNE_OUVERT_ROBINET"},{"layerKey":"aep_vanne","styleKey":"AEP_VANNE_OUVERT_TOUR"}],"segment":"details"}],"context":{"zoom":15.82636492846038,"lng":2.731025681541041,"lat":48.418368923352034,"url":"/home/exploitation","layers":[["aep_vanne","AEP_VANNE_FERME_ROBINET"],["aep_vanne","AEP_VANNE_FERME_ROBINET_1"],["aep_vanne","AEP_VANNE_FERME_TOUR"],["aep_vanne","AEP_VANNE_FERME_ELECTRO"],["aep_vanne","AEP_VANNE_OUVERT_ROBINET"],["aep_vanne","AEP_VANNE_OUVERT_TOUR"],["aep_vanne","AEP_VANNE_OUVERT_ELECTRO"],["aep_canalisation","AEP_CANALISATION"],["aep_canalisation","AEP_CANALISATION_1"],["aep_canalisation","AEP_CANALISATION_2"]]}}	interne	\N
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: nomad; Owner: sys_admin
--

SELECT pg_catalog.setval('nomad.users_id_seq', 75, true);


--
-- PostgreSQL database dump complete
--

