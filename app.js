/* ═════════ THEMES — full cargo palette ═════════ */
const THEMES = [
  { id: "sage",      name: "D350 Sage",      hex: "KAIRO #E54E23", sw: ["#C5D1B5", "#181C19", "#E54E23"] },
  { id: "hyperlime", name: "TRA Hyperlime",  hex: "LIME #D9FF3D",  sw: ["#D9FF3D", "#141711", "#E54E23"] },
  { id: "dune",      name: "NCX Dune",       hex: "DUNE #403D38",  sw: ["#403D38", "#EDE6D6", "#E54E23"] },
  { id: "almond",    name: "Almond Day",     hex: "ALMOND #CDC5BA",sw: ["#CDC5BA", "#2B2724", "#E54E23"] },
  { id: "aerospace", name: "Aerospace Blue", hex: "BLUE #1F27FF",  sw: ["#1F27FF", "#F0F1FF", "#FF5A26"] },
  { id: "arc",       name: "ARC Signal",     hex: "ARC #FFD21F",   sw: ["#FFD21F", "#161513", "#E54E23"] }
];
const BASE_TAGS = [
  { id: "ai-infra",  label: "AI INFRA" }, { id: "cloud", label: "CLOUD" },
  { id: "inference", label: "INFERENCE" }, { id: "mlops", label: "MLOPS" },
  { id: "devops",    label: "DEVOPS" }, { id: "infra", label: "INFRA" },
  { id: "platform",  label: "PLATFORM" }, { id: "ml-infra", label: "ML INFRA" },
  { id: "network",   label: "NETWORK" }
];

/* ═════════ DEFAULT POSTS (seed; overridden by CMS/Supabase) ═════════ */
const DEFAULT_POSTS = [
  { id: "vllm-inference", num: "052", cat: "inference", catLabel: "INFERENCE",
    title: "Serving LLMs at 4x: vLLM and KV-Cache Tuning",
    excerpt: "Inference log — continuous batching plus PagedAttention took a 7B model from 18 to 74 tok/s on a single A10G.",
    read: "14 MIN", date: "SEP 02 2026", level: "LVL-03", hot: true, tags: ["INFERENCE", "vLLM", "GPU"],
    body: "<p>Inference is where model quality meets the cloud bill. Baseline: plain generate() on a 7B instruct model, fp16, one A10G — <strong>18 tok/s, OOM past 2 concurrent users</strong>.</p><h3>1. vLLM plus PagedAttention</h3><p>Continuous batching with paged KV-cache: <strong>74 tok/s at 8 concurrent</strong>. Same GPU. Prefix caching cut system-prompt-heavy traffic by 31 percent.</p><pre><code>python -m vllm.entrypoints.openai.api_server --model mistralai/Mistral-7B-Instruct-v0.3 --max-model-len 8192 --gpu-memory-utilization 0.9 --enable-prefix-caching</code></pre><h3>2. What I measure</h3><p>TTFT, inter-token latency, and throughput at p95 concurrency — not single-stream speed. Size max-model-len from real prompt histograms or the KV cache starves.</p><blockquote>Autoscale on waiting-queue depth via KEDA, not GPU util. Queues predict latency; util lags it.</blockquote>" },
  { id: "gpu-cluster-ai-infra", num: "051", cat: "ai-infra", catLabel: "AI INFRA",
    title: "AI Infrastructure: NCCL, NVLink and Multi-GPU Sanity",
    excerpt: "Why 8xH100 trained slower than 4xH100 — NCCL flags, fabric checks, and the all-reduce bottleneck.",
    read: "11 MIN", date: "AUG 28 2026", level: "LVL-04", hot: true, tags: ["AI INFRA", "GPU", "NCCL"],
    body: "<p>Doubling GPUs gave <strong>1.3x speedup instead of 2x</strong>. Classic interconnect issue.</p><h3>1. Verify fabric first</h3><pre><code>nvidia-smi nvlink --status\nnccl-tests/build/all_reduce_perf -b 1G -e 8G -f 2 -g 8</code></pre><p>My culprit: two nodes on different rails forcing fallback. Bus bandwidth showed 42 GB/s instead of NVLink-local rates.</p><h3>2. Fix order</h3><p>Pin NCCL_IB_HCA, set the socket interface to the rail NIC, enable GPUDirect. Re-ran at 1.86x scaling.</p><blockquote>Log bus bandwidth, not just step time. Fabric lies quietly; benchmarks do not.</blockquote>" },
  { id: "eks-karpenter-cloud", num: "050", cat: "cloud", catLabel: "CLOUD",
    title: "Cloud Engineering: EKS plus Karpenter Scale-to-Zero",
    excerpt: "Cut a dev cluster bill 64 percent with consolidation, interruption handling, and right-sized NodePools.",
    read: "10 MIN", date: "AUG 22 2026", level: "LVL-03", hot: false, tags: ["CLOUD", "EKS", "K8S"],
    body: "<p>Idle nodes are the quietest budget fire. Moved staging EKS from static node groups to Karpenter with consolidation.</p><h3>Results</h3><p>Monthly compute <strong>$1,140 down to $410</strong>. Consolidation repacks under-utilized nodes continuously; spot-first with on-demand fallback.</p><blockquote>Set PodDisruptionBudgets before enabling consolidation, or stateful dev DBs learn to fly.</blockquote>" },
  { id: "mlops-registry", num: "049", cat: "mlops", catLabel: "MLOPS",
    title: "MLOps: A Model Registry That Actually Rolls Back",
    excerpt: "MLflow plus S3 plus canary promotion stages. The rollback drill that saved a Friday deploy.",
    read: "9 MIN", date: "AUG 16 2026", level: "LVL-03", hot: false, tags: ["MLOPS", "MLFLOW", "CI/CD"],
    body: "<p>Registry without promotion rules is a model attic. Stages: None to Staging to Production to Archived, every transition gated by eval metrics plus approval in CI.</p><pre><code>mlflow.register_model(f\"runs:/{run_id}/model\", \"reranker-v3\")\n# promote only if ndcg@10 delta &gt; +1.5% on holdout</code></pre><p>Canary 5 percent traffic with auto-rollback on p99 latency or CTR drop. Used it twice. It works.</p><blockquote>Version data plus code plus image digest together, or you cannot reproduce the incident.</blockquote>" },
  { id: "gitops-devops", num: "048", cat: "devops", catLabel: "DEVOPS",
    title: "DevOps: GitOps With ArgoCD and Sealed Secrets",
    excerpt: "From kubectl-apply chaos to app-of-apps, image updater, and sync waves. Full repo layout inside.",
    read: "8 MIN", date: "AUG 09 2026", level: "LVL-02", hot: false, tags: ["DEVOPS", "ARGOCD", "GITOPS"],
    body: "<p>Every manual kubectl edit was an untracked incident. Moved to app-of-apps: one root app syncing apps per service, sync-waves for CRDs first, automated prune plus self-heal.</p><p>Secrets via SealedSecrets, image tags via Argo Image Updater with semver constraints. Drift now pages instead of festering.</p><blockquote>Git is the only writer. If it did not go through a PR, it did not happen.</blockquote>" },
  { id: "terraform-infra", num: "047", cat: "infra", catLabel: "INFRA",
    title: "Infrastructure as Code: Terraform Modules That Scale",
    excerpt: "Composable VPC, EKS, RDS modules, remote state per env, and the lint gates before apply.",
    read: "7 MIN", date: "JUL 30 2026", level: "LVL-02", hot: false, tags: ["INFRA", "TERRAFORM", "IaC"],
    body: "<p>Flat Terraform roots rot. Split into modules plus envs, S3 backend with lock table, one state per env per component.</p><p>CI runs fmt, validate, tflint, checkov, then speculative plan on PR. Apply only on main with manual approval for prod.</p><blockquote>Small blast radius beats clever modules. One apply should never touch two environments.</blockquote>" },
  { id: "idp-platform", num: "046", cat: "platform", catLabel: "PLATFORM",
    title: "Platform Engineering: Golden Paths and Backstage IDP",
    excerpt: "Scaffolder templates for inference services — Dockerfile, Helm, CI, dashboards in 90 seconds.",
    read: "9 MIN", date: "JUL 22 2026", level: "LVL-03", hot: true, tags: ["PLATFORM", "IDP", "BACKSTAGE"],
    body: "<p>Every team hand-rolling Helm charts means nine flavors of broken. Built one golden path: a scaffolder template generating service skeleton, Helm values, CI, Grafana dashboard, and the ArgoCD app.</p><p>Adoption went from 2 to 11 services in 6 weeks. Scorecards track production-readiness: runbook, alerts, SLO.</p><blockquote>Platform success equals time-to-first-deploy dropping, not YAML lines owned.</blockquote>" },
  { id: "feature-store-ml-infra", num: "045", cat: "ml-infra", catLabel: "ML INFRA",
    title: "ML Infrastructure: Feature Store Without the Pain",
    excerpt: "Feast plus Parquet plus online Redis. Point-in-time correctness finally clicked.",
    read: "10 MIN", date: "JUL 14 2026", level: "LVL-03", hot: false, tags: ["ML INFRA", "FEAST", "PIPELINES"],
    body: "<p>Training-serving skew haunted a ranking model for weeks. Offline joins used latest features; online served stale ones. Point-in-time joins fixed it.</p><p>Offline on Parquet in S3, online in Redis, materialization lag as an SLO with alerts instead of hope.</p><blockquote>If features are not versioned with the model, the model is not reproducible.</blockquote>" },
  { id: "ebpf-network", num: "044", cat: "network", catLabel: "NETWORK",
    title: "Network Engineering: Finding 400ms With eBPF",
    excerpt: "Cilium plus Hubble. The cross-AZ NAT hairpin adding p99 latency to inference calls.",
    read: "8 MIN", date: "JUL 05 2026", level: "LVL-03", hot: false, tags: ["NETWORK", "eBPF", "K8S"],
    body: "<p>Inference p99 spiked 400ms only on multi-AZ rollouts. Hubble flows showed egress leaving via a NAT gateway in another AZ, then back. Classic hairpin.</p><p>Fix: per-AZ egress gateway policy plus service affinity. p99 back to 90ms. eBPF made the invisible visible.</p><blockquote>When latency is AZ-correlated, suspect topology before code.</blockquote>" }
];

/* ═════════ DEFAULT PROJECTS / TRENDS / PROFILE ═════════ */
const DEFAULT_PROJECTS = [
  { id: "p-infer", n: "08", tag: "01 / SERVING", name: "Infer Gateway", sub: "Autoscaled<br>Inference", desc: "vLLM behind K8s gateway API, KEDA scale-to-zero, prefix caching, canary by header. 74 tok/s per A10G.", stack: ["vLLM", "K8S", "KEDA"], accent: true },
  { id: "p-gpu", n: "06", tag: "02 / SCHEDULING", name: "GPU Scheduler", sub: "Binpacked<br>GPU Fleet", desc: "Karpenter GPU NodePools, time-slicing for dev, MPS for notebooks. Quotas per team, spot-first.", stack: ["EKS", "KARPENTER", "GPU"], accent: false },
  { id: "p-mlops", n: "04", tag: "03 / MLOPS", name: "Model Pipeline", sub: "Registry<br>& Rollback", desc: "MLflow registry plus Feast plus Argo Workflows. Eval-gated promotion, 5 percent canary, one-click rollback.", stack: ["MLFLOW", "FEAST", "ARGO"], accent: false },
  { id: "p-idp", n: "09", tag: "04 / PLATFORM", name: "IDP Portal", sub: "Golden<br>Paths", desc: "Backstage scaffolder plus scorecards. Inference service live in 90s with dashboards and alerts baked in.", stack: ["BACKSTAGE", "HELM", "CI"], accent: false },
  { id: "p-net", n: "03", tag: "05 / NETWORK", name: "Net Observe", sub: "eBPF<br>Visibility", desc: "Cilium plus Hubble plus Prometheus. Per-AZ egress, DNS latency maps, dropped-flow alerts.", stack: ["CILIUM", "eBPF", "PROM"], accent: false },
  { id: "p-eks", n: "07", tag: "06 / CLOUD", name: "EKS Blueprint", sub: "GitOps<br>Baseline", desc: "Terraform VPC/EKS/RDS plus ArgoCD app-of-apps plus sealed secrets. Prod baseline in one apply.", stack: ["TERRAFORM", "ARGOCD", "AWS"], accent: false }
];
const DEFAULT_TRENDS = [
  { id: "t1", n: "S01", t: "Inference Optimization Is the New Training", d: "Prefix caching, speculative decoding, disaggregated prefill/decode. Throughput per dollar beats raw FLOPs.", pct: "98.5%" },
  { id: "t2", n: "S02", t: "GPUs Are Scheduled, Not Just Bought", d: "MIG, time-slicing, quota-aware schedulers, spot playbooks. Utilization is the metric.", pct: "76.4%" },
  { id: "t3", n: "S03", t: "Platform Teams Ship Golden Paths", d: "Scaffolder templates plus scorecards replace ticket ops. Time-to-first-deploy is the north star.", pct: "69.6%" },
  { id: "t4", n: "S04", t: "eBPF Replaces Sidecars", d: "Cilium ambient mesh plus Hubble. Network policy becomes testable code.", pct: "58.7%" },
  { id: "t5", n: "S05", t: "Scale-to-Zero Everywhere", d: "KEDA plus Karpenter consolidation. Idle inference and dev envs cost near zero.", pct: "46.8%" }
];
const DEFAULT_PROFILE = {
  name: "Arafat Sani", role: "AI Infrastructure / Platform Engineer",
  bio: "I build and document production AI infrastructure — inference gateways on Kubernetes, GPU scheduling, MLOps pipelines and internal developer platforms. This log is my lab notebook: every perf win and outage, written up so you can reproduce it.",
  location: "Remote / Earth", status: "Open to infra roles", avatar: "", email: "yasirarafat9287@gmail.com",
  experience: [
    { title: "AI Platform Engineer", company: "Contract / Freelance", years: "2024 — Present", bullets: ["Serve LLM workloads on Kubernetes with vLLM, autoscaling cost to near-zero when idle", "Operate GPU scheduling and quotas across teams, holding utilization above 75%", "Ship Backstage golden paths cutting service setup from weeks to a day"] },
    { title: "DevOps Engineer", company: "Contract / Freelance", years: "2022 — 2024", bullets: ["Migrated manual deploys to ArgoCD GitOps with sealed secrets", "Cut cloud spend 60% with right-sizing and spot-first scheduling", "Owned Prometheus/Grafana alerting with actionable on-call signal"] }
  ],
  skills: [{ name: "Kubernetes / EKS", pct: 90 }, { name: "Python / Go", pct: 85 }, { name: "Inference (vLLM/CUDA)", pct: 82 }, { name: "Terraform / GitOps", pct: 88 }, { name: "Networking / eBPF", pct: 74 }],
  stack: ["Python", "Go", "Kubernetes", "Terraform", "ArgoCD", "vLLM", "MLflow", "Feast", "Cilium", "Prometheus", "AWS"],
  certs: [{ title: "Certified Kubernetes Administrator", issuer: "CNCF", year: "2025" }, { title: "AWS Solutions Architect – Associate", issuer: "AWS", year: "2024" }, { title: "Machine Learning Engineering", issuer: "Self-driven plus prod", year: "2026" }],
  education: [{ degree: "BSc Computer Science", school: "University", years: "2020 - 2024", note: "Systems, networks, ML. Thesis on GPU scheduling." }, { degree: "MLOps Specialization", school: "Online plus Prod", years: "2025", note: "Pipelines, registries, deployment strategies in production." }]
};

/* ═════════ RESUME ROLE PRESETS (ATS keyword + duty tailoring) ═════════ */
const ROLE_PRESETS = {
  "AI Infrastructure Engineer": { kw: ["GPU clusters", "NCCL", "NVLink", "CUDA", "Slurm", "Kubernetes", "PyTorch", "Distributed training"],
    summary: "Infrastructure engineer focused on GPU compute at scale — cluster bring-up, fabric debugging, and reliable distributed training in production.",
    duties: ["Brought up and operated multi-node GPU clusters (NVLink/InfiniBand) serving training and inference", "Debugged NCCL collectives with nccl-tests, improving multi-node scaling efficiency to 1.8x+ on 8 GPUs", "Built GPU quota and scheduling playbooks (MIG, time-slicing) raising fleet utilization above 75%", "Automated node health checks and FABRIC validation, cutting silent hardware failures", "Partnered with ML teams to right-size precision and parallelism strategies per workload", "Maintained runbooks for NCCL timeouts, IB flaps, and CUDA version skew"] },
  "Cloud Engineer": { kw: ["AWS", "EKS", "Terraform", "Karpenter", "VPC", "IAM", "RDS", "CloudWatch"],
    summary: "Cloud engineer building cost-efficient, secure AWS platforms with infrastructure as code and scale-to-zero compute.",
    duties: ["Provisioned VPC, EKS, and RDS estates with Terraform modules across dev/staging/prod", "Cut compute spend 60%+ with Karpenter consolidation and spot-first scheduling", "Hardened IAM with least-privilege roles and SealedSecrets for GitOps delivery", "Built CloudWatch dashboards and alarms for SLOs, latency, and error budgets", "Drove tagging and FinOps chargeback per namespace and team", "Led incident reviews with blameless postmortems and tracked action items"] },
  "Inference Engineer": { kw: ["vLLM", "TensorRT-LLM", "KV-cache", "Continuous batching", "CUDA", "HPA", "KEDA", "Prometheus"],
    summary: "Inference engineer squeezing maximum tokens-per-dollar from GPUs — serving stacks, cache tuning, and autoscaling on Kubernetes.",
    duties: ["Served 7B-class LLMs with vLLM at 4x baseline throughput via continuous batching and PagedAttention", "Tuned KV-cache sizing and prefix caching, cutting tail latency and memory waste", "Built KEDA autoscaling on queue-depth metrics with scale-to-zero for idle cost savings", "Defined TTFT, inter-token latency, and p95-concurrency SLOs with Prometheus alerting", "Ran canary promotions with automatic rollback on latency or quality regression", "Benchmarked quantization trade-offs (FP16/INT8) balancing quality and throughput"] },
  "MLOps Engineer": { kw: ["MLflow", "Kubeflow", "Feast", "Argo Workflows", "CI/CD", "Model registry", "Canary", "Evidently"],
    summary: "MLOps engineer shipping models safely — registries, eval-gated promotion, canary delivery, and one-click rollback.",
    duties: ["Built MLflow model registry with Staging-to-Production promotion gates on holdout metrics", "Orchestrated training and eval pipelines with Argo Workflows and Kubeflow", "Implemented 5% canary releases with auto-rollback on latency or business-metric drift", "Set up feature pipelines with Feast, enforcing point-in-time correctness", "Versioned data, code, and image digests together for full reproducibility", "Monitored production models for drift and wired alerts to on-call"] },
  "DevOps Engineer": { kw: ["ArgoCD", "GitOps", "GitHub Actions", "Docker", "Helm", "SealedSecrets", "Prometheus", "Grafana"],
    summary: "DevOps engineer running GitOps delivery — app-of-apps rollouts, sealed secrets, and observable pipelines.",
    duties: ["Migrated manual kubectl workflows to ArgoCD app-of-apps with automated sync and self-heal", "Built CI pipelines with image scanning, semver promotion, and deployment gates", "Managed secrets with SealedSecrets; eliminated plaintext credentials from git", "Standardized Helm charts and Kustomize overlays across services", "Owned Prometheus/Grafana monitoring with actionable, non-noisy alerting", "Reduced deploy lead time from days to under an hour"] },
  "Infrastructure Engineer": { kw: ["Terraform", "Linux", "Networking", "PostgreSQL", "Redis", "Bare metal", "Backups", "HA"],
    summary: "Infrastructure engineer owning the boring-and-reliable layer — IaC, data stores, backups, and high availability.",
    duties: ["Managed Terraform estates with remote state, locks, and per-environment blast-radius limits", "Operated PostgreSQL and Redis with backups, PITR drills, and failover runbooks", "Hardened Linux fleets with patching cadences and CIS-aligned baselines", "Designed HA topologies across availability zones with tested failover", "Built internal runbooks cutting MTTR on recurring incidents", "Enforced change control with plan-on-PR and manual production approval"] },
  "Platform Engineer": { kw: ["Backstage", "IDP", "Golden paths", "Scorecards", "Helm", "Scaffolder", "SLOs", "Developer experience"],
    summary: "Platform engineer multiplying developer output — golden paths, internal developer portals, and paved-road defaults.",
    duties: ["Built Backstage scaffolder templates shipping production-ready services in minutes", "Defined golden paths for inference, APIs, and workers with baked-in dashboards and alerts", "Launched production-readiness scorecards tracking runbooks, SLOs, and ownership", "Cut time-to-first-deploy from weeks to same-day across adopting teams", "Ran platform office hours and docs, converting ticket ops into self-serve", "Measured platform success on DORA-style throughput and stability metrics"] },
  "ML Infrastructure Engineer": { kw: ["Feature stores", "Feast", "Spark", "Parquet", "S3", "Training pipelines", "Data versioning", "Great Expectations"],
    summary: "ML infrastructure engineer connecting data to training — feature platforms, reliable pipelines, and skew-free serving.",
    duties: ["Built Feast feature store on S3/Parquet offline with Redis online serving", "Eliminated training-serving skew with point-in-time joins and materialization SLOs", "Orchestrated batch pipelines with retries, backfills, and data-quality gates", "Versioned datasets enabling exact experiment reproduction", "Set freshness and completeness SLAs with paging alerts on breach", "Partnered with data scientists to productionize notebook prototypes"] },
  "Network Engineer": { kw: ["eBPF", "Cilium", "BGP", "VPC", "DNS", "TLS", "Hubble", "Service mesh"],
    summary: "Network engineer making the invisible visible — eBPF observability, sane topology, and latency hunts with data.",
    duties: ["Deployed Cilium with Hubble flow observability across Kubernetes clusters", "Diagnosed cross-AZ hairpins and NAT bottlenecks, cutting p99 latency 4x", "Designed per-AZ egress and service affinity policies as reviewable code", "Owned DNS latency budgets and TLS termination posture", "Built dropped-flow and policy-violation alerting to on-call channels", "Documented network topology and runbooks for partition scenarios"] },
  "Generalist": { kw: ["Kubernetes", "Python", "Terraform", "CI/CD", "Linux", "PostgreSQL", "Monitoring", "GitOps"],
    summary: "Hands-on engineer across the stack — clusters, pipelines, and production systems, documented in public.",
    duties: ["Shipped and operated production services end to end, from IaC to on-call", "Automated toil away with scripts, pipelines, and paved-road defaults", "Debugged across layers — app, platform, network — with benchmarks, not guesses", "Wrote runbooks and public field notes so fixes compound across the team", "Balanced delivery speed with reliability budgets and cost awareness", "Mentored through code review and pairing on infrastructure changes"] }
};

/* ═════════ STORE + STATE ═════════ */
const slugify = s => String(s || "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
const clone = o => JSON.parse(JSON.stringify(o));
const store = {
  get(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const validPosts = a => Array.isArray(a) && a.length && a.every(p => p && p.id && p.title);
let POSTS = validPosts(store.get("sani_posts", null)) ? store.get("sani_posts", null) : clone(DEFAULT_POSTS);
let PROJECTS = (Array.isArray(store.get("sani_projects", null)) && store.get("sani_projects", null).length) ? store.get("sani_projects", null) : clone(DEFAULT_PROJECTS);
let TRENDS = (Array.isArray(store.get("sani_trends", null)) && store.get("sani_trends", null).length) ? store.get("sani_trends", null) : clone(DEFAULT_TRENDS);
let PROFILE = store.get("sani_profile", null) || clone(DEFAULT_PROFILE);
let activeFilter = "all";
let customTags = store.get("sani_custom_tags", []);
let deletedTags = store.get("sani_deleted_tags", []);
let tagOverrides = store.get("sani_post_tags", {});
let saved = new Set(store.get("sani_saved", []));
POSTS.forEach(p => { if (!p.status) p.status = "published"; if (p.cover === undefined) p.cover = ""; if (p.series === undefined) p.series = ""; if (p.format === undefined) p.format = "html"; });
let views = store.get("sani_views", {});
let likes = new Set(store.get("sani_likes", []));
let sortMode = "new";
if (PROFILE.email === undefined) PROFILE.email = "yasirarafat9287@gmail.com";
const persistLocal = () => {
  store.set("sani_posts", POSTS); store.set("sani_projects", PROJECTS);
  store.set("sani_trends", TRENDS); store.set("sani_profile", PROFILE);
};
const getPostTags = p => tagOverrides[p.id] || p.tags || [];
const visibleTags = () => [...BASE_TAGS.filter(t => !deletedTags.includes(t.id)), ...customTags];
const tagLabelOf = id => {
  const v = visibleTags().find(t => t.id === id); if (v) return v.label;
  const b = BASE_TAGS.find(t => t.id === id); return b ? b.label : String(id || "").toUpperCase();
};
const matchesTag = (post, fid) => {
  if (fid === "all") return true;
  if (post.cat === fid) return true;
  return getPostTags(post).some(t => slugify(t) === fid);
};
const isDue = p => (p.status || "published") !== "scheduled" || !p.publish_at || new Date(p.publish_at) <= new Date();
const published = () => POSTS.filter(p => (p.status || "published") !== "draft" && isDue(p));
function autoPublish() {
  let changed = false;
  POSTS.forEach(p => { if (p.status === "scheduled" && p.publish_at && new Date(p.publish_at) <= new Date()) { p.status = "published"; changed = true; sbPush("posts", postToRow(p)); } });
  if (changed) persistLocal();
}
const countFor = fid => published().filter(p => matchesTag(p, fid)).length;
const stripHtml = h => String(h || "").replace(/<[^>]*>/g, " ");
const escHtml = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/* Minimal Markdown → HTML (headings, bold/italic/code, fences, quotes, lists, links) */
function mdToHtml(src) {
  const lines = String(src || "").replace(/\r/g, "").split("\n");
  let html = "", inCode = false, codeBuf = [], inList = false;
  const inline = t => escHtml(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inCode) { html += `<pre><code>${escHtml(codeBuf.join("\n"))}</code></pre>`; codeBuf = []; inCode = false; }
      else { closeList(); inCode = true; }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }
    if (/^#{1,3}\s/.test(line)) { closeList(); const l = line.match(/^(#{1,3})/)[1].length; html += `<h3>${inline(line.replace(/^#{1,3}\s*/, ""))}</h3>`; continue; }
    if (/^&gt;/.test(escHtml(line)) || /^>\s?/.test(line)) { closeList(); html += `<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`; continue; }
    if (/^([-*]|\d+\.)\s+/.test(line)) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(line.replace(/^([-*]|\d+\.)\s+/, ""))}</li>`; continue; }
    if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) { closeList(); html += "<hr>"; continue; }
    if (!line.trim()) { closeList(); continue; }
    closeList(); html += `<p>${inline(line)}</p>`;
  }
  closeList();
  if (inCode) html += `<pre><code>${escHtml(codeBuf.join("\n"))}</code></pre>`;
  return html;
}
const estRead = html => Math.max(1, Math.ceil(stripHtml(html).split(/\s+/).filter(Boolean).length / 200)) + " MIN";

/* ═════════ SUPABASE LAYER ═════════
   Tables (run once in Supabase SQL Editor):
   create table if not exists posts (id text primary key, num text, cat text, cat_label text, title text, excerpt text, read text, date text, level text, hot boolean, tags text[], body text);
   create table if not exists projects (id text primary key, n text, tag text, name text, sub text, desc text, stack text[], accent boolean);
   create table if not exists trends (id text primary key, n text, t text, d text, pct text);
   create table if not exists profile (id text primary key, data jsonb); */
let sb = null;
function sbStatusEl() { return document.getElementById("sbStatus"); }
function sbInit() {
  let url = String(store.get("sani_sb_url", "") || "").trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/i, "");
  const key = String(store.get("sani_sb_key", "") || "").trim();
  if (url && url !== store.get("sani_sb_url", "")) store.set("sani_sb_url", url);
  if (url && key && window.supabase) {
    try {
      sb = window.supabase.createClient(url, key);
      sbStatusEl().textContent = "● SUPABASE LIVE";
      sbPull().catch(() => { sbStatusEl().textContent = "● SUPABASE ERROR — LOCAL"; });
    } catch { sb = null; sbStatusEl().textContent = "● LOCAL MODE"; }
  } else { sb = null; if (sbStatusEl()) sbStatusEl().textContent = "● LOCAL MODE"; }
  const u = document.getElementById("sbUrl"), k = document.getElementById("sbKey");
  if (u) u.value = store.get("sani_sb_url", ""); if (k) k.value = store.get("sani_sb_key", "");
  const ar = document.getElementById("sbAuthRow");
  if (ar) ar.hidden = !sb;
  paintAuth();
  if (sb && sb.auth) sb.auth.getSession().then(({ data }) => {
    if (data && data.session) { sessionStorage.setItem("sani_admin", "1"); paintAuth(); }
  }).catch(() => {});
}
const postToRow = p => ({ id: p.id, num: p.num, cat: p.cat, cat_label: p.catLabel, title: p.title, excerpt: p.excerpt, read: p.read, date: p.date, level: p.level, hot: !!p.hot, tags: getPostTags(p), body: p.body, status: p.status || "published", cover: p.cover || "", series: p.series || "", publish_at: p.publish_at || "", format: p.format || "html", raw: p.raw || "" });
const rowToPost = r => ({ id: r.id, num: r.num, cat: r.cat, catLabel: r.cat_label || r.catLabel, title: r.title, excerpt: r.excerpt, read: r.read, date: r.date, level: r.level, hot: !!r.hot, tags: r.tags || [], body: r.body || "", status: r.status || "published", cover: r.cover || "", series: r.series || "", publish_at: r.publish_at || "", format: r.format || "html", raw: r.raw || "" });
async function sbPull() {
  if (!sb) return;
  const [po, pr, tr, pf, rc] = await Promise.all([
    sb.from("posts").select("*"), sb.from("projects").select("*"),
    sb.from("trends").select("*"), sb.from("profile").select("*").eq("id", "main").maybeSingle(),
    sb.from("reactions").select("*").then(r => r, () => ({ data: null }))
  ]);
  let changed = false;
  if (po.data && po.data.length) { POSTS = po.data.map(rowToPost); changed = true; }
  if (pr.data && pr.data.length) { PROJECTS = pr.data; changed = true; }
  if (tr.data && tr.data.length) { TRENDS = tr.data; changed = true; }
  if (pf.data && pf.data.data) { PROFILE = pf.data.data; changed = true; }
  if (rc.data) rc.data.forEach(r => { serverReacts[r.post_id] = r; });
  if (changed) { persistLocal(); renderAll(); renderAdminLists(); }
}
async function sbPush(table, row) { if (!sb) return null; try { const { error } = await sb.from(table).upsert(row); return error ? error.message : null; } catch (e) { return String((e && e.message) || e); } }
async function sbDel(table, id) { if (!sb) return null; try { const { error } = await sb.from(table).delete().eq("id", id); return error ? error.message : null; } catch (e) { return String((e && e.message) || e); } }
function toast(msg, ok = true) {
  const t = document.getElementById("syncToast"); if (!t) return;
  t.textContent = msg; t.hidden = false; t.classList.toggle("err", !ok);
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 5000);
}
async function saveWithToast(promise) {
  if (!sb) { toast("✓ SAVED LOCALLY — connect Supabase to sync", true); try { await promise; } catch {} return null; }
  const err = await promise;
  toast(err ? "✕ SUPABASE ERROR: " + err : "✓ SAVED + SYNCED TO SUPABASE", !err);
  return err;
}
async function sbUpload(file, prefix) {
  if (!sb || !file) return null;
  try {
    const ext = ((file.name || "img").split(".").pop() || "jpg").toLowerCase().slice(0, 4);
    const path = `${prefix}/${Date.now().toString(36)}.${ext}`;
    const { error } = await sb.storage.from("media").upload(path, file, { upsert: true });
    if (error) return null;
    return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  } catch { return null; }
}
const fileToURL = f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });

/* ═════════ THEMES ═════════ */
function renderThemes() {
  const cur = document.documentElement.dataset.theme || "aerospace";
  document.getElementById("themeOpts").innerHTML = THEMES.map(t => `
    <button class="theme-opt ${t.id === cur ? "active" : ""}" data-theme-id="${t.id}">
      <span class="swatches">${t.sw.map(c => `<i style="background:${c}"></i>`).join("")}</span>
      <span>${t.name}<br><span class="theme-hex">${t.hex}</span></span>
      <span>${t.id === cur ? "●" : "○"}</span>
    </button>`).join("");
  const a = THEMES.find(t => t.id === cur);
  if (a) document.getElementById("sysTheme").textContent = `THEME: ${a.name.toUpperCase()} // ${a.hex}`;
}
function setTheme(id) { document.documentElement.dataset.theme = id; store.set("sani_theme", id); renderThemes(); }
document.getElementById("themeBtn").addEventListener("click", e => { e.stopPropagation(); document.getElementById("themePanel").classList.toggle("open"); });
document.addEventListener("click", e => { if (!e.target.closest(".theme-wrap")) document.getElementById("themePanel").classList.remove("open"); });
document.getElementById("themeOpts").addEventListener("click", e => {
  const b = e.target.closest("[data-theme-id]"); if (b) setTheme(b.dataset.themeId);
});

/* ═════════ FILTER TAGS ═════════ */
function renderFilters() {
  const tags = visibleTags();
  document.getElementById("filterRow").innerHTML =
    `<button class="f-pill ${activeFilter === "all" ? "active" : ""}" data-filter="all">ALL <span class="cnt">[${published().length}]</span></button>` +
    tags.map(t => `<button class="f-pill ${activeFilter === t.id ? "active" : ""}" data-filter="${t.id}">${t.label} <span class="cnt">[${countFor(t.id)}]</span><span class="del" data-del="${t.id}" title="Delete tag">×</span></button>`).join("");
  const sel = document.getElementById("pfCat");
  if (sel) sel.innerHTML = visibleTags().map(t => `<option value="${t.id}">${t.label}</option>`).join("");
}
document.getElementById("filterRow").addEventListener("click", e => {
  const del = e.target.closest("[data-del]");
  if (del) { e.stopPropagation(); deleteFilterTag(del.dataset.del); return; }
  const pill = e.target.closest("[data-filter]"); if (!pill) return;
  activeFilter = pill.dataset.filter; renderFilters();
  renderLogs(activeFilter, document.getElementById("searchInput").value);
});
function deleteFilterTag(id) {
  if (BASE_TAGS.some(t => t.id === id)) { if (!deletedTags.includes(id)) deletedTags.push(id); store.set("sani_deleted_tags", deletedTags); }
  else { customTags = customTags.filter(t => t.id !== id); store.set("sani_custom_tags", customTags); }
  if (activeFilter === id) activeFilter = "all";
  renderFilters(); renderLogs(activeFilter, document.getElementById("searchInput").value);
}
function addCustomTag(raw) {
  const label = String(raw || "").trim().toUpperCase().slice(0, 24); if (!label) return false;
  const id = slugify(label); if (!id || id === "all") return false;
  if (!(BASE_TAGS.some(t => t.id === id) || customTags.some(t => t.id === id))) {
    deletedTags = deletedTags.filter(d => d !== id); store.set("sani_deleted_tags", deletedTags);
    customTags.push({ id, label }); store.set("sani_custom_tags", customTags);
  }
  activeFilter = id; renderFilters(); renderLogs(activeFilter, document.getElementById("searchInput").value); return true;
}
document.getElementById("addTagBtn").addEventListener("click", () => {
  const f = document.getElementById("addTagForm"); f.classList.toggle("open");
  if (f.classList.contains("open")) document.getElementById("addTagInput").focus();
});
document.getElementById("addTagForm").addEventListener("submit", e => {
  e.preventDefault();
  if (addCustomTag(document.getElementById("addTagInput").value)) { document.getElementById("addTagInput").value = ""; document.getElementById("addTagForm").classList.remove("open"); }
});
document.getElementById("resetTags").addEventListener("click", () => {
  customTags = []; deletedTags = []; activeFilter = "all";
  store.set("sani_custom_tags", []); store.set("sani_deleted_tags", []);
  renderFilters(); renderLogs("all", document.getElementById("searchInput").value);
});

/* ═════════ LOGS ═════════ */
function logCard(p, i) {
  const cls = p.hot ? "log-card hot" : (i % 3 === 2 ? "log-card ink-card" : "log-card");
  const tags = getPostTags(p);
  const cover = p.cover ? `<div class="log-cover"><img src="${p.cover}" alt="" loading="lazy" /></div>` : "";
  return `<article class="${cls}${saved.has(p.id) ? " saved" : ""}" data-id="${p.id}" tabindex="0" role="button" aria-label="Read ${p.title}">
    <div class="saved-flag">★ SAVED LOG</div>
    <div class="log-top"><span>LOG-${p.num}</span><span>◉ ${p.date}</span></div>${cover}
    <div class="log-num">${String(p.num).slice(1)}</div>
    <div class="log-cat">${p.catLabel} // ${p.level}</div>
    <h3 class="log-title">${p.title}</h3><p class="log-ex">${p.excerpt}</p>
    <div class="log-meta">${tags.map(t => `<span>${t}</span>`).join("")}<span>${p.read}</span></div>
    <div class="log-bar"></div><div class="log-foot"><b>→</b><span>OPEN RUNBOOK</span></div></article>`;
}
function renderLogs(filter = "all", q = "") {
  const query = q.trim().toLowerCase();
  const list = published().filter(p => {
    const okF = matchesTag(p, filter);
    const hay = (p.title + " " + p.excerpt + " " + getPostTags(p).join(" ") + " " + p.cat + " " + p.catLabel + " " + stripHtml(p.body)).toLowerCase();
    return okF && (!query || hay.includes(query));
  });
  document.getElementById("logsCount").textContent =
    `SHOWING ${list.length} OF ${published().length} PUBLISHED LOGS${query ? ` — "${q.trim().toUpperCase()}"` : ""} — PRESS / TO SEARCH`;
  if (sortMode === "old") list.sort((a, b) => a.num.localeCompare(b.num));
  else if (sortMode === "read") list.sort((a, b) => (views[b.id] || 0) - (views[a.id] || 0));
  else list.sort((a, b) => b.num.localeCompare(a.num));
  const grid = document.getElementById("logsGrid");
  grid.innerHTML = list.length ? list.map(logCard).join("") :
    `<div style="grid-column:1/-1;border:1.5px dashed var(--ink);padding:36px;text-align:center;font-family:var(--mono);font-size:12px">⊘ NO LOGS FOR THIS FILTER — <button class="f-pill" onclick="resetLogs()">SHOW ALL</button></div>`;
  grid.querySelectorAll(".log-card").forEach(c => {
    c.addEventListener("click", () => openPost(c.dataset.id));
    c.addEventListener("keydown", e => { if (e.key === "Enter") openPost(c.dataset.id); });
  });
}
window.resetLogs = () => { activeFilter = "all"; document.getElementById("searchInput").value = ""; renderFilters(); renderLogs(); };
document.getElementById("sortSel").addEventListener("change", e => {
  sortMode = e.target.value;
  renderLogs(activeFilter, document.getElementById("searchInput").value);
});
document.getElementById("searchInput").addEventListener("input", e => renderLogs(activeFilter, e.target.value));

/* ═════════ PROJECTS + TRENDS + PROFILE ═════════ */
function renderProjects() {
  document.getElementById("projGrid").innerHTML = PROJECTS.map(p => `
    <div class="proj-card ${p.accent ? "feat-proj" : ""} reveal in" data-pid="${p.id}" tabindex="0">
      <div class="proj-head"><span>${p.name}</span><span>${p.tag}</span></div>
      <div class="proj-bignum">${p.n}</div><div class="proj-name">${p.sub}</div>
      <p class="proj-desc">${p.desc}</p>
      <div class="proj-tags">${(p.stack || []).map(s => `<span>${s}</span>`).join("")}</div>
      <div class="proj-foot"><a href="#">● LIVE →</a><a href="#">SPECS →</a></div>
    </div>`).join("");
}
/* Active stack follows hover/focus — one highlighted card at a time, default restores on leave */
function paintActiveProj(id) {
  document.querySelectorAll("#projGrid .proj-card").forEach(c => c.classList.toggle("feat-proj", c.dataset.pid === id));
}
const defaultProjId = () => { const d = PROJECTS.find(p => p.accent) || PROJECTS[0]; return d && d.id; };
document.getElementById("projGrid").addEventListener("mouseover", e => {
  const c = e.target.closest(".proj-card"); if (c) paintActiveProj(c.dataset.pid);
});
document.getElementById("projGrid").addEventListener("mouseleave", () => paintActiveProj(defaultProjId()));
document.getElementById("projGrid").addEventListener("focusin", e => {
  const c = e.target.closest(".proj-card"); if (c) paintActiveProj(c.dataset.pid);
});
document.getElementById("projGrid").addEventListener("focusout", () => paintActiveProj(defaultProjId()));
document.getElementById("projGrid").addEventListener("click", e => {
  const c = e.target.closest(".proj-card"); if (c) paintActiveProj(c.dataset.pid);
});
function renderTrends() {
  const tl = document.getElementById("trendList");
  tl.innerHTML = TRENDS.map((t, i) => `
    <div class="trend-row" tabindex="0"><span class="t-num">0${i + 1}</span>
      <div><h4>${t.t}</h4><p>${t.n} // TRACKED SIGNAL</p><div class="trend-detail">${t.d}</div></div>
      <span class="t-pct">${t.pct}</span></div>`).join("");
  tl.querySelectorAll(".trend-row").forEach(r => {
    const tg = () => r.classList.toggle("open");
    r.addEventListener("click", tg); r.addEventListener("keydown", e => { if (e.key === "Enter") tg(); });
  });
}
function renderProfile() {
  const p = PROFILE;
  document.getElementById("profileName").textContent = p.name || "";
  document.getElementById("profileRole").textContent = p.role || "";
  document.getElementById("profileBio").textContent = p.bio || "";
  document.getElementById("profileLocation").textContent = p.location || "";
  document.getElementById("profileStatus").textContent = p.status || "";
  const img = document.getElementById("profileAvatar"), fb = document.getElementById("avatarFallback");
  if (p.avatar) { img.src = p.avatar; img.hidden = false; fb.style.display = "none"; }
  else { img.hidden = true; fb.style.display = ""; fb.textContent = (p.name || "AS").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }
  document.getElementById("skillsList").innerHTML = (p.skills || []).map(s => `
    <div class="skill"><div class="skill-top"><span>${s.name}</span><b>${s.pct}%</b></div>
    <div class="skill-bar"><i data-w="${s.pct}"></i></div></div>`).join("");
  requestAnimationFrame(() => setTimeout(() =>
    document.querySelectorAll(".skill-bar i").forEach(i => i.style.width = i.dataset.w + "%"), 80));
  document.getElementById("stackChips").innerHTML = (p.stack || []).map(s => `<span>${s}</span>`).join("");
  document.getElementById("certsList").innerHTML = (p.certs || []).map(c => `<div class="cert"><b>${c.title}</b><span>${c.issuer} — ${c.year}</span></div>`).join("");
  document.getElementById("eduList").innerHTML = (p.education || []).map(x => `<div class="edu"><b>${x.degree}</b><span>${x.school} · ${x.years}</span><p>${x.note || ""}</p></div>`).join("");
}
/* ═════════ AUTO-SYNCED STATS + DYNAMIC FEATURED ═════════ */
function renderStats() {
  const n = published().length;
  const tracks = new Set(published().map(p => p.cat)).size;
  const setNum = (id, val, suffix = "") => {
    const el = document.getElementById(id); if (!el) return;
    el.dataset.count = val;
    el.textContent = String(val).padStart(2, "0") + suffix;
  };
  setNum("statLogs", n); setNum("statProjects", PROJECTS.length, "+");
  const fl = document.getElementById("featNumLogs"); if (fl) fl.textContent = published().length ? published().map(p => p.num).sort().reverse()[0] : "000";
  const fs = document.getElementById("featNumStacks"); if (fs) fs.textContent = String(PROJECTS.length).padStart(2, "0");
  const dl = document.getElementById("dataLogs"); if (dl) dl.textContent = n;
  const dt = document.getElementById("dataTracks"); if (dt) dt.textContent = String(tracks).padStart(2, "0");
  const sl = document.getElementById("sigLogs"); if (sl) sl.textContent = n + "+";
  const st = document.getElementById("sigTracks"); if (st) st.textContent = String(tracks).padStart(2, "0");
}
function renderFeatured() {
  const p = published().find(x => x.hot) || published()[0]; if (!p) return;
  const ek = document.getElementById("featKicker"); if (ek) ek.textContent = `LOG-${p.num} / ${p.catLabel}`;
  const et = document.getElementById("featTitle"); if (et) et.textContent = p.title;
  const es = document.getElementById("featSub"); if (es) es.textContent = p.excerpt;
  const em = document.getElementById("featMeta");
  if (em) em.innerHTML = getPostTags(p).slice(0, 2).map(t => `<span class="tag">${t}</span>`).join("") + `<span class="mono">${p.read} READ — ${p.date}</span>`;
  const b = document.getElementById("featBtn"); if (b) b.onclick = () => openPost(p.id);
}
function renderAll() { renderFilters(); renderLogs(activeFilter, document.getElementById("searchInput").value); renderProjects(); renderTrends(); renderProfile(); renderStats(); renderFeatured(); }

/* ═════════ READER MODAL ═════════ */
const modal = document.getElementById("readerModal"), mBody = document.getElementById("mBody");
let currentPost = null;
function renderModalTags() {
  document.getElementById("mTagList").innerHTML = getPostTags(currentPost).map(t =>
    `<span class="m-tag">${t}<button data-mdel="${t}">×</button></span>`).join("");
}
document.getElementById("mTagList").addEventListener("click", e => {
  const b = e.target.closest("[data-mdel]"); if (!b || !currentPost || !authed()) return;
  tagOverrides[currentPost.id] = getPostTags(currentPost).filter(t => t !== b.dataset.mdel);
  store.set("sani_post_tags", tagOverrides); persistLocal();
  const p = POSTS.find(x => x.id === currentPost.id); if (p) sbPush("posts", postToRow(p));
  renderModalTags(); paintModalMeta(); renderFilters(); renderLogs(activeFilter, document.getElementById("searchInput").value);
});
function addModalTag(raw) {
  if (!authed()) return;
  const label = String(raw || "").trim().toUpperCase().slice(0, 24); if (!label || !currentPost) return;
  const tags = getPostTags(currentPost); if (tags.includes(label)) return;
  tagOverrides[currentPost.id] = [...tags, label]; store.set("sani_post_tags", tagOverrides);
  const id = slugify(label);
  if (id && id !== "all" && !BASE_TAGS.some(t => t.id === id) && !customTags.some(t => t.id === id)) {
    customTags.push({ id, label }); store.set("sani_custom_tags", customTags);
  }
  const p = POSTS.find(x => x.id === currentPost.id); if (p) { persistLocal(); sbPush("posts", postToRow(p)); }
  renderModalTags(); paintModalMeta(); renderFilters(); renderLogs(activeFilter, document.getElementById("searchInput").value);
}
document.getElementById("mTagAdd").addEventListener("click", () => {
  const i = document.getElementById("mTagInput"); addModalTag(i.value); i.value = ""; i.focus();
});
document.getElementById("mTagInput").addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); addModalTag(e.target.value); e.target.value = ""; }
});
function paintModalMeta() {
  document.getElementById("mMeta").innerHTML = `<span>${currentPost.date}</span>${getPostTags(currentPost).map(t => `<span>${t}</span>`).join("")}<span>${currentPost.level}</span>`;
}
function renderRelated(id) {
  const cur = POSTS.find(x => x.id === id); if (!cur) return;
  const pool = published().filter(p => p.id !== id);
  const same = pool.filter(p => p.cat === cur.cat);
  const rest = pool.filter(p => p.cat !== cur.cat);
  const picks = [...same, ...rest].slice(0, 3);
  document.getElementById("mRelated").innerHTML = picks.length ? picks.map(p => `
    <div class="rel-row" data-rel="${p.id}" tabindex="0"><b>LOG-${p.num}</b><div><b>${p.title}</b><br><span>${p.catLabel} · ${p.read}</span></div><span>→</span></div>`).join("")
    : `<div style="font-family:var(--mono);font-size:11px">No other published logs yet.</div>`;
  document.querySelectorAll("#mRelated .rel-row").forEach(r => {
    const go = () => openPost(r.dataset.rel);
    r.addEventListener("click", go); r.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  });
}
function buildToc() {
  const live = [...document.getElementById("mContent").querySelectorAll("h3")];
  const wrap = document.getElementById("mTocWrap"), box = document.getElementById("mToc");
  if (live.length < 2) { wrap.hidden = true; box.innerHTML = ""; return; }
  wrap.hidden = false;
  live.forEach((h, i) => h.id = "sec-" + i);
  box.innerHTML = live.map((h, i) => `<a data-sec="sec-${i}">→ ${escHtml(h.textContent)}</a>`).join("");
  box.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    const t = document.getElementById(a.dataset.sec);
    if (t) mBody.scrollTo({ top: t.offsetTop - 16, behavior: "smooth" });
  }));
}
function renderSeriesNav() {
  const wrap = document.getElementById("mSeriesWrap"), box = document.getElementById("mSeries");
  const key = (currentPost.series || "").trim();
  if (!key) { wrap.hidden = true; return; }
  const seq = published().filter(p => (p.series || "").trim() === key).sort((a, b) => a.num.localeCompare(b.num));
  const i = seq.findIndex(p => p.id === currentPost.id);
  wrap.hidden = false;
  const btn = (p, label) => p ? `<button data-sgo="${p.id}">${label}<br><b>${escHtml(p.title)}</b></button>` : `<button disabled>${label}<br><b>—</b></button>`;
  box.innerHTML = btn(seq[i - 1], "← PREV") + btn(seq[i + 1], "NEXT →");
  box.querySelectorAll("[data-sgo]").forEach(b => b.addEventListener("click", () => openPost(b.dataset.sgo)));
}
let serverReacts = {};
function paintEngagement() {
  const v = views[currentPost.id] || 0;
  const base = (serverReacts[currentPost.id] && serverReacts[currentPost.id].likes) || 0;
  document.getElementById("mViews").textContent = `◉ ${v} READ${v === 1 ? "" : "S"}`;
  document.getElementById("mLike").textContent = `${likes.has(currentPost.id) ? "♥ LIKED" : "♡ LIKE"} (${base + (likes.has(currentPost.id) ? 1 : 0)})`;
}
function pushReactions() {
  if (!currentPost) return;
  const base = (serverReacts[currentPost.id] && serverReacts[currentPost.id].likes) || 0;
  const row = { post_id: currentPost.id, likes: base + (likes.has(currentPost.id) ? 1 : 0), views: Math.max(views[currentPost.id] || 0, (serverReacts[currentPost.id] && serverReacts[currentPost.id].views) || 0) };
  serverReacts[currentPost.id] = row;
  sbPush("reactions", row);
}
function gCfg() { return { on: store.get("sani_giscus_on", false), repo: store.get("sani_giscus_repo", ""), repoId: store.get("sani_giscus_repoId", ""), cat: store.get("sani_giscus_cat", "General"), catId: store.get("sani_giscus_catId", "") }; }
function loadGiscus() {
  const c = gCfg(), wrap = document.getElementById("mCommentsWrap"), box = document.getElementById("mComments");
  box.innerHTML = "";
  if (!c.on || !c.repo || !c.repoId || !c.catId) { wrap.hidden = true; return; }
  wrap.hidden = false;
  const s = document.createElement("script");
  s.src = "https://giscus.app/client.js";
  s.setAttribute("data-repo", c.repo); s.setAttribute("data-repo-id", c.repoId);
  s.setAttribute("data-category", c.cat); s.setAttribute("data-category-id", c.catId);
  s.setAttribute("data-mapping", "specific"); s.setAttribute("data-term", "LOG-" + currentPost.num + " " + currentPost.title);
  s.setAttribute("data-reactions-enabled", "1"); s.setAttribute("data-theme", "light");
  s.setAttribute("crossorigin", "anonymous"); s.async = true;
  box.appendChild(s);
}
function openPost(id) {
  const p = POSTS.find(x => x.id === id); if (!p) return; currentPost = p;
  document.getElementById("mKicker").textContent = `LOG-${p.num} // ${p.catLabel} — ${p.read}`;
  document.getElementById("mTitle").textContent = p.title;
  document.getElementById("mContent").innerHTML = p.body;
  document.title = `${p.title} — SANI.LOG`;
  document.getElementById("metaDesc").setAttribute("content", p.excerpt);
  paintModalMeta(); renderModalTags(); renderRelated(id);
  const cw = document.getElementById("mCoverWrap");
  if (p.cover) { document.getElementById("mCover").src = p.cover; cw.hidden = false; } else cw.hidden = true;
  buildToc(); renderSeriesNav(); loadGiscus();
  views[p.id] = (views[p.id] || 0) + 1; store.set("sani_views", views);
  paintEngagement(); pushReactions();
  document.getElementById("mLike").onclick = () => {
    likes.has(p.id) ? likes.delete(p.id) : likes.add(p.id);
    store.set("sani_likes", [...likes]); paintEngagement(); pushReactions();
    renderLogs(activeFilter, document.getElementById("searchInput").value);
  };
  const bm = document.getElementById("mBookmark");
  bm.textContent = saved.has(id) ? "★ SAVED" : "♡ SAVE LOG";
  bm.onclick = () => { saved.has(id) ? saved.delete(id) : saved.add(id); store.set("sani_saved", [...saved]); bm.textContent = saved.has(id) ? "★ SAVED" : "♡ SAVE LOG"; renderLogs(activeFilter, document.getElementById("searchInput").value); };
  mBody.scrollTop = 0; document.getElementById("mProgress").style.width = "0%";
  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
  try { history.replaceState(null, "", `?log=${p.id}`); } catch {}
}
function closePost() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; currentPost = null; document.title = "SANI.LOG — Infrastructure Intelligence Hub"; try { history.replaceState(null, "", location.pathname); } catch {} }
modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closePost));
document.addEventListener("keydown", e => { if (e.key === "Escape") { closePost(); closeAdmin(); palClose(); resClose(); document.getElementById("themePanel").classList.remove("open"); } });
mBody.addEventListener("scroll", () => {
  const max = mBody.scrollHeight - mBody.clientHeight;
  document.getElementById("mProgress").style.width = (max > 0 ? (mBody.scrollTop / max) * 100 : 0) + "%";
});
document.querySelectorAll("[data-open-post]").forEach(b => b.addEventListener("click", () => openPost(b.dataset.openPost)));

/* ═════════ ADMIN CMS ═════════ */
const drawer = document.getElementById("adminDrawer"), overlay = document.getElementById("adminOverlay");
const authed = () => sessionStorage.getItem("sani_admin") === "1";
function openAdmin(tab) {
  drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); overlay.hidden = false;
  document.getElementById("adminLock").style.display = authed() ? "none" : "";
  document.getElementById("adminBody").hidden = !authed();
  if (tab) switchTab(tab);
  if (authed()) { renderAdminLists(); fillAboutForm(); fillGiscus(); }
}
function closeAdmin() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); overlay.hidden = true; }
document.getElementById("adminBtn").addEventListener("click", () => openAdmin());
document.getElementById("mobileAdmin").addEventListener("click", e => { e.preventDefault(); document.getElementById("mobileMenu").classList.remove("open"); openAdmin(); });
document.getElementById("editProfileBtn").addEventListener("click", () => openAdmin("about"));
document.getElementById("adminClose").addEventListener("click", closeAdmin);
overlay.addEventListener("click", closeAdmin);
document.getElementById("adminUnlock").addEventListener("click", () => {
  if (document.getElementById("adminPw").value === store.get("sani_admin_pw", "admin123")) {
    sessionStorage.setItem("sani_admin", "1"); paintAdminGated(); openAdmin();
  } else alert("Wrong passcode.");
});
function paintAuth() {
  const out = document.getElementById("sbLogout"), inn = document.getElementById("sbLogin");
  const logged = authed();
  if (out) out.hidden = !logged;
  if (inn) inn.hidden = logged;
}
document.getElementById("sbLogin").addEventListener("click", async () => {
  if (!sb) { alert("Connect Supabase first."); return; }
  const email = document.getElementById("sbEmail").value.trim();
  const password = document.getElementById("sbPass").value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) alert("Login failed: " + error.message);
  else { sessionStorage.setItem("sani_admin", "1"); paintAuth(); paintAdminGated(); openAdmin(); }
});
document.getElementById("sbLogout").addEventListener("click", async () => {
  if (sb) try { await sb.auth.signOut(); } catch {}
  sessionStorage.removeItem("sani_admin"); paintAuth(); paintAdminGated(); closeAdmin();
});
function fillGiscus() {
  const c = gCfg();
  document.getElementById("gComments").checked = !!c.on;
  document.getElementById("gRepo").value = c.repo || "";
  document.getElementById("gRepoId").value = c.repoId || "";
  document.getElementById("gCat").value = c.cat || "";
  document.getElementById("gCatId").value = c.catId || "";
}
document.getElementById("giscusForm").addEventListener("submit", e => {
  e.preventDefault();
  store.set("sani_giscus_on", document.getElementById("gComments").checked);
  store.set("sani_giscus_repo", document.getElementById("gRepo").value.trim());
  store.set("sani_giscus_repoId", document.getElementById("gRepoId").value.trim());
  store.set("sani_giscus_cat", document.getElementById("gCat").value.trim() || "General");
  store.set("sani_giscus_catId", document.getElementById("gCatId").value.trim());
  alert("Comments config saved.");
});
document.getElementById("newsForm").addEventListener("submit", async e => {
  e.preventDefault();
  const em = document.getElementById("newsEmail").value.trim().toLowerCase(); if (!em) return;
  const list = store.get("sani_subs", []);
  if (!list.includes(em)) { list.push(em); store.set("sani_subs", list); }
  if (sb) try { await sb.from("subscribers").upsert({ email: em }); } catch {}
  document.getElementById("newsOk").hidden = false;
  document.getElementById("newsEmail").value = "";
  setTimeout(() => document.getElementById("newsOk").hidden = true, 3500);
});
function switchTab(name) {
  document.querySelectorAll(".admin-tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".admin-pane").forEach(p => p.hidden = p.dataset.pane !== name);
}
document.querySelectorAll(".admin-tabs button").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

let editingPost = null, editingProj = null, editingTrend = null;
const postForm = document.getElementById("postForm");
const pfTitle = document.getElementById("pfTitle"), pfCat = document.getElementById("pfCat"),
      pfRead = document.getElementById("pfRead"), pfExcerpt = document.getElementById("pfExcerpt"),
      pfLevel = document.getElementById("pfLevel"), pfHot = document.getElementById("pfHot"),
      pfTags = document.getElementById("pfTags"), pfBody = document.getElementById("pfBody"),
      pfStatus = document.getElementById("pfStatus"), pfCover = document.getElementById("pfCover"),
      pfSeries = document.getElementById("pfSeries"), pfPublishAt = document.getElementById("pfPublishAt"),
      pfMd = document.getElementById("pfMd");
const projForm = document.getElementById("projForm");
const jfName = document.getElementById("jfName"), jfSub = document.getElementById("jfSub"), jfTag = document.getElementById("jfTag"),
      jfDesc = document.getElementById("jfDesc"), jfStack = document.getElementById("jfStack"),
      jfNum = document.getElementById("jfNum"), jfAccent = document.getElementById("jfAccent");
const trendForm = document.getElementById("trendForm");
const tfTitle = document.getElementById("tfTitle"), tfDesc = document.getElementById("tfDesc"), tfPct = document.getElementById("tfPct");

function renderAdminLists() {
  document.getElementById("adminPostList").innerHTML = POSTS.map(p => `
    <div class="admin-item"><div><b>LOG-${p.num} — ${p.title}${(p.status || "published") === "draft" ? `<span class="draft-pill">DRAFT</span>` : ""}</b><small>${p.catLabel} · ${getPostTags(p).join(", ")}</small></div>
    <div class="row"><button data-ep="${p.id}">EDIT</button><button data-dp="${p.id}">DEL</button></div></div>`).join("");
  document.getElementById("adminProjList").innerHTML = PROJECTS.map(p => `
    <div class="admin-item"><div><b>${p.n} — ${p.name}</b><small>${p.tag}</small></div>
    <div class="row"><button data-ej="${p.id}">EDIT</button><button data-dj="${p.id}">DEL</button></div></div>`).join("");
  document.getElementById("adminTrendList").innerHTML = TRENDS.map(t => `
    <div class="admin-item"><div><b>${t.n} — ${t.t}</b><small>${t.pct}</small></div>
    <div class="row"><button data-et="${t.id}">EDIT</button><button data-dt="${t.id}">DEL</button></div></div>`).join("");
}
document.getElementById("adminBody").addEventListener("click", e => {
  const ep = e.target.closest("[data-ep]"), dp = e.target.closest("[data-dp]");
  const ej = e.target.closest("[data-ej]"), dj = e.target.closest("[data-dj]");
  const et = e.target.closest("[data-et]"), dt = e.target.closest("[data-dt]");
  if (ep) {
    const p = POSTS.find(x => x.id === ep.dataset.ep); editingPost = p.id;
    document.getElementById("postFormTitle").textContent = "EDIT LOG-" + p.num;
    pfTitle.value = p.title; pfCat.value = p.cat; pfRead.value = p.read; pfExcerpt.value = p.excerpt;
    pfLevel.value = p.level; pfHot.checked = !!p.hot; pfStatus.value = p.status || "published"; pfCover.value = (p.cover || "").startsWith("http") ? p.cover : ""; pfSeries.value = p.series || ""; pfPublishAt.value = p.publish_at || "";
    pfMd.checked = (p.format || "html") === "markdown";
    pfTags.value = getPostTags(p).join(", "); pfBody.value = (pfMd.checked && p.raw) ? p.raw : p.body;
    document.getElementById("pfPreview").hidden = true;
    postForm.hidden = false;
  }
  if (dp && confirm("Delete this log?")) {
    POSTS = POSTS.filter(x => x.id !== dp.dataset.dp); persistLocal(); saveWithToast(sbDel("posts", dp.dataset.dp)); renderAll(); renderAdminLists();
  }
  if (ej) {
    const p = PROJECTS.find(x => x.id === ej.dataset.ej); editingProj = p.id;
    jfName.value = p.name; jfSub.value = p.sub; jfTag.value = p.tag; jfDesc.value = p.desc;
    jfStack.value = (p.stack || []).join(", "); jfNum.value = p.n; jfAccent.checked = !!p.accent;
    projForm.hidden = false;
  }
  if (dj && confirm("Delete this stack?")) {
    PROJECTS = PROJECTS.filter(x => x.id !== dj.dataset.dj); persistLocal(); saveWithToast(sbDel("projects", dj.dataset.dj)); renderAll(); renderAdminLists();
  }
  if (et) {
    const t = TRENDS.find(x => x.id === et.dataset.et); editingTrend = t.id;
    tfTitle.value = t.t; tfDesc.value = t.d; tfPct.value = t.pct; trendForm.hidden = false;
  }
  if (dt && confirm("Delete this signal?")) {
    TRENDS = TRENDS.filter(x => x.id !== dt.dataset.dt); persistLocal(); saveWithToast(sbDel("trends", dt.dataset.dt)); renderAll(); renderAdminLists();
  }
});
document.getElementById("newPostBtn").addEventListener("click", () => {
  editingPost = null; document.getElementById("postFormTitle").textContent = "NEW LOG";
  postForm.reset(); pfHot.checked = false; pfStatus.value = "published"; postForm.hidden = false;
});
document.getElementById("postFormCancel").addEventListener("click", () => { postForm.hidden = true; editingPost = null; });
postForm.addEventListener("submit", e => {
  e.preventDefault();
  const catId = pfCat.value || "infra";
  const tags = pfTags.value.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
  const useMd = pfMd.checked;
  const htmlBody = useMd ? mdToHtml(pfBody.value) : pfBody.value;
  const readVal = pfRead.value.trim() || estRead(htmlBody);
  const seriesVal = pfSeries.value.trim().toLowerCase().replace(/\s+/g, "-");
  const schedVal = pfStatus.value === "scheduled" ? (pfPublishAt.value || "") : "";
  if (editingPost) {
    const p = POSTS.find(x => x.id === editingPost);
    Object.assign(p, { title: pfTitle.value, cat: catId, catLabel: tagLabelOf(catId), read: readVal, excerpt: pfExcerpt.value, level: pfLevel.value || "LVL-02", hot: pfHot.checked, body: htmlBody, raw: useMd ? pfBody.value : "", format: useMd ? "markdown" : "html", status: pfStatus.value, cover: pfCover.value.trim(), series: seriesVal, publish_at: schedVal });
    tagOverrides[p.id] = tags.length ? tags : [p.catLabel]; store.set("sani_post_tags", tagOverrides);
    persistLocal(); saveWithToast(sbPush("posts", postToRow(p)));
  } else {
    const maxNum = Math.max(...POSTS.map(p => parseInt(p.num, 10) || 0), 52);
    const id = slugify(pfTitle.value) + "-" + Date.now().toString(36);
    const p = { id, num: String(maxNum + 1).padStart(3, "0"), cat: catId, catLabel: tagLabelOf(catId), title: pfTitle.value, excerpt: pfExcerpt.value, read: readVal, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(), level: pfLevel.value || "LVL-02", hot: pfHot.checked, tags: [], body: htmlBody, raw: useMd ? pfBody.value : "", format: useMd ? "markdown" : "html", status: pfStatus.value, cover: pfCover.value.trim(), series: seriesVal, publish_at: schedVal };
    POSTS.unshift(p);
    tagOverrides[id] = tags.length ? tags : [p.catLabel]; store.set("sani_post_tags", tagOverrides);
    persistLocal(); saveWithToast(sbPush("posts", postToRow(p)));
  }
  postForm.hidden = true; editingPost = null; renderAll(); renderAdminLists();
});
document.getElementById("newProjBtn").addEventListener("click", () => { editingProj = null; projForm.reset(); projForm.hidden = false; });
document.getElementById("projFormCancel").addEventListener("click", () => { projForm.hidden = true; editingProj = null; });
projForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = { name: jfName.value, sub: jfSub.value || jfName.value, tag: jfTag.value || "STACK", desc: jfDesc.value, stack: jfStack.value.split(",").map(s => s.trim()).filter(Boolean), n: jfNum.value || "01", accent: jfAccent.checked };
  if (editingProj) { Object.assign(PROJECTS.find(x => x.id === editingProj), data); saveWithToast(sbPush("projects", { id: editingProj, ...data })); }
  else { const id = "p-" + slugify(data.name) + "-" + Date.now().toString(36); PROJECTS.push({ id, ...data }); saveWithToast(sbPush("projects", { id, ...data })); }
  persistLocal(); projForm.hidden = true; editingProj = null; renderAll(); renderAdminLists();
});
document.getElementById("newTrendBtn").addEventListener("click", () => { editingTrend = null; trendForm.reset(); trendForm.hidden = false; });
document.getElementById("trendFormCancel").addEventListener("click", () => { trendForm.hidden = true; editingTrend = null; });
trendForm.addEventListener("submit", e => {
  e.preventDefault();
  if (editingTrend) {
    const t = TRENDS.find(x => x.id === editingTrend);
    Object.assign(t, { t: tfTitle.value, d: tfDesc.value, pct: tfPct.value });
    saveWithToast(sbPush("trends", { id: t.id, n: t.n, t: t.t, d: t.d, pct: t.pct }));
  } else {
    const id = "t-" + Date.now().toString(36);
    const n = "S" + String(TRENDS.length + 1).padStart(2, "0");
    TRENDS.push({ id, n, t: tfTitle.value, d: tfDesc.value, pct: tfPct.value });
    saveWithToast(sbPush("trends", { id, n, t: tfTitle.value, d: tfDesc.value, pct: tfPct.value }));
  }
  persistLocal(); trendForm.hidden = true; editingTrend = null; renderAll(); renderAdminLists();
});

/* --- about CRUD --- */
function fillAboutForm() {
  document.getElementById("afName").value = PROFILE.name || "";
  document.getElementById("afRole").value = PROFILE.role || "";
  document.getElementById("afBio").value = PROFILE.bio || "";
  document.getElementById("afLoc").value = PROFILE.location || "";
  document.getElementById("afStatus").value = PROFILE.status || "";
  document.getElementById("afEmail").value = PROFILE.email || "";
  document.getElementById("afAvatar").value = PROFILE.avatar && PROFILE.avatar.startsWith("http") ? PROFILE.avatar : "";
  document.getElementById("afSkills").value = (PROFILE.skills || []).map(s => `${s.name}:${s.pct}`).join("\n");
  document.getElementById("afStack").value = (PROFILE.stack || []).join(", ");
  document.getElementById("afCerts").value = (PROFILE.certs || []).map(c => `${c.title} | ${c.issuer} | ${c.year}`).join("\n");
  document.getElementById("afEdu").value = (PROFILE.education || []).map(x => `${x.degree} | ${x.school} | ${x.years} | ${x.note || ""}`).join("\n");
  document.getElementById("afExp").value = (PROFILE.experience || []).map(x => `${x.title} | ${x.company} | ${x.years} | ${(x.bullets || []).join(" ; ")}`).join("\n");
}
document.getElementById("aboutForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  PROFILE = {
    ...PROFILE, name: v("afName"), role: v("afRole"), bio: v("afBio"), location: v("afLoc"), status: v("afStatus"), email: v("afEmail"),
    avatar: v("afAvatar") || PROFILE.avatar,
    skills: v("afSkills").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const i = l.lastIndexOf(":");
      return { name: (i > 0 ? l.slice(0, i) : l).trim(), pct: Math.max(0, Math.min(100, parseInt(i > 0 ? l.slice(i + 1) : "70", 10) || 70)) };
    }),
    stack: v("afStack").split(",").map(s => s.trim()).filter(Boolean),
    certs: v("afCerts").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const [title, issuer, year] = l.split("|").map(s => (s || "").trim()); return { title, issuer, year };
    }),
    education: v("afEdu").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const [degree, school, years, note] = l.split("|").map(s => (s || "").trim()); return { degree, school, years, note };
    }),
    experience: v("afExp").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const parts = l.split("|").map(s => (s || "").trim());
      return { title: parts[0] || "", company: parts[1] || "", years: parts[2] || "", bullets: (parts[3] || "").split(";").map(s => s.trim()).filter(Boolean) };
    })
  };
  persistLocal(); saveWithToast(sbPush("profile", { id: "main", data: PROFILE }));
  renderProfile();
});
document.getElementById("pfPreviewBtn").addEventListener("click", () => {
  const box = document.getElementById("pfPreview");
  const raw = document.getElementById("pfBody").value;
  box.innerHTML = pfMd.checked ? mdToHtml(raw) : raw;
  box.hidden = !box.hidden;
  document.getElementById("pfPreviewBtn").textContent = box.hidden ? "👁 PREVIEW →" : "👁 HIDE PREVIEW";
});
document.getElementById("pfCoverFile").addEventListener("change", async e => {
  const f = e.target.files[0]; if (!f) return;
  pfCover.value = (await sbUpload(f, "covers")) || await fileToURL(f);
});
document.getElementById("avatarInput").addEventListener("change", async e => {
  const f = e.target.files[0]; if (!f) return;
  PROFILE.avatar = (await sbUpload(f, "avatars")) || await fileToURL(f);
  persistLocal(); saveWithToast(sbPush("profile", { id: "main", data: PROFILE })); renderProfile();
});

/* --- settings --- */
document.getElementById("sbForm").addEventListener("submit", e => {
  e.preventDefault();
  store.set("sani_sb_url", document.getElementById("sbUrl").value.trim());
  store.set("sani_sb_key", document.getElementById("sbKey").value.trim());
  sbInit(); alert("Supabase config saved — syncing.");
});
document.getElementById("sbDisconnect").addEventListener("click", () => {
  store.del("sani_sb_url"); store.del("sani_sb_key"); sb = null; sbInit();
});
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ posts: POSTS, projects: PROJECTS, trends: TRENDS, profile: PROFILE, customTags }, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sani-log-backup.json"; a.click();
});
document.getElementById("importInput").addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (validPosts(d.posts)) POSTS = d.posts;
      POSTS.forEach(p => { if (!p.status) p.status = "published"; if (p.cover === undefined) p.cover = ""; if (p.series === undefined) p.series = ""; if (p.format === undefined) p.format = "html"; });
      if (Array.isArray(d.projects) && d.projects.length) PROJECTS = d.projects;
      if (Array.isArray(d.trends) && d.trends.length) TRENDS = d.trends;
      if (d.profile) PROFILE = d.profile;
      if (Array.isArray(d.customTags)) { customTags = d.customTags; store.set("sani_custom_tags", customTags); }
      persistLocal(); renderAll(); renderAdminLists(); alert("Import complete.");
    } catch { alert("Invalid JSON file."); }
  };
  r.readAsText(f);
});
document.getElementById("pwSave").addEventListener("click", () => {
  const v = document.getElementById("pwNew").value.trim();
  if (v) { store.set("sani_admin_pw", v); document.getElementById("pwNew").value = ""; alert("Passcode updated."); }
});
document.getElementById("resetAllBtn").addEventListener("click", () => {
  if (!confirm("Reset everything to defaults? Local edits will be lost.")) return;
  ["sani_posts", "sani_projects", "sani_trends", "sani_profile", "sani_post_tags"].forEach(k => store.del(k));
  POSTS = clone(DEFAULT_POSTS); PROJECTS = clone(DEFAULT_PROJECTS); TRENDS = clone(DEFAULT_TRENDS); PROFILE = clone(DEFAULT_PROFILE); tagOverrides = {};
  persistLocal(); renderAll(); renderAdminLists(); fillAboutForm();
});

/* ═════════ FX ═════════ */
const io = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target; io.unobserve(el);
  const target = +el.dataset.count; let cur = 0;
  const step = Math.max(1, Math.round(target / 40));
  const t = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = String(cur).padStart(2, "0"); }, 30);
}), { threshold: .5 });
document.querySelectorAll("[data-count]").forEach(el => io.observe(el));
function tickClock() {
  const d = new Date();
  document.getElementById("sysClock").textContent = "SEPTEMBER 2026 // " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const lc = document.getElementById("liveClock2");
  if (lc) lc.textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
setInterval(tickClock, 1000); tickClock();
document.getElementById("menuBtn").addEventListener("click", () => document.getElementById("mobileMenu").classList.toggle("open"));
document.querySelectorAll("#mobileMenu a").forEach(a => a.addEventListener("click", () => document.getElementById("mobileMenu").classList.remove("open")));
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault(); document.getElementById("formOk").hidden = false;
  e.target.querySelector("button").textContent = "✓ ROUTED";
  setTimeout(() => { e.target.reset(); e.target.querySelector("button").textContent = "CONTACT →"; document.getElementById("formOk").hidden = true; }, 3500);
});
const rio = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); }
}), { threshold: .12 });
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  document.getElementById("scrollProgress").style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  document.getElementById("toTop").classList.toggle("show", h.scrollTop > 600);
}, { passive: true });
document.getElementById("toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ═════════ RESUME BUILDER (ATS export + optional AI polish — ADMIN ONLY) ═════════ */
let resDraft = { title: "Generalist", summary: "", bullets: [], expOn: [] };
function paintAdminGated() { document.body.classList.toggle("is-admin", authed()); }
function resSkills(title) {
  const base = (ROLE_PRESETS[title] || ROLE_PRESETS.Generalist).kw.slice();
  const seen = new Set(base.map(s => String(s).toLowerCase()));
  (PROFILE.stack || []).forEach(s => { if (!seen.has(String(s).toLowerCase())) { seen.add(String(s).toLowerCase()); base.push(s); } });
  return base.slice(0, 14);
}
function resLoadPreset(title, keepCustom = true) {
  const preset = ROLE_PRESETS[title] || ROLE_PRESETS.Generalist;
  const customs = keepCustom ? resDraft.bullets.filter(b => b.custom && b.on) : [];
  resDraft = { title, summary: preset.summary,
    bullets: [...preset.duties.map(t => ({ t, on: true })), ...customs],
    expOn: (PROFILE.experience || []).map(() => true) };
}
function resCollect() {
  document.querySelectorAll("#resDuties input").forEach((c, i) => { if (resDraft.bullets[i]) resDraft.bullets[i].on = c.checked; });
  document.querySelectorAll("#resExp input").forEach((c, i) => { resDraft.expOn[i] = c.checked; });
  resDraft.summary = document.getElementById("resSummary").value;
  resDraft.title = document.getElementById("resTitle").value;
}
function resRenderLists() {
  document.getElementById("resExp").innerHTML = (PROFILE.experience || []).map((e, i) =>
    `<label class="res-check"><input type="checkbox" data-e="${i}" ${resDraft.expOn[i] ? "checked" : ""} /><span><b>${escHtml(e.title)}</b> — ${escHtml(e.company)} · ${escHtml(e.years)}</span></label>`).join("") || `<div style="font-size:12px;opacity:.7">No experience yet — add some in ADMIN → ABOUT.</div>`;
  document.getElementById("resDuties").innerHTML = resDraft.bullets.map((b, i) =>
    `<label class="res-check"><input type="checkbox" data-b="${i}" ${b.on ? "checked" : ""} /><span>${escHtml(b.t)}</span></label>`).join("");
}
function buildResumeBody() {
  const p = PROFILE, d = resDraft;
  const skills = resSkills(d.title).join(", ");
  const pool = d.bullets.filter(b => b.on).map(b => b.t);
  const exps = (p.experience || []).map((e, idx) => {
    if (d.expOn[idx] === false) return "";
    const extra = idx === 0 ? pool : [];
    const all = [...(e.bullets || []), ...extra];
    return `<h2>${escHtml(e.title)} — ${escHtml(e.company)}</h2><p><i>${escHtml(e.years)}</i></p><ul>${all.map(b => `<li>${escHtml(b)}</li>`).join("")}</ul>`;
  }).join("");
  return `<h1>${escHtml(p.name || "")}</h1><p>${escHtml(d.title)}${p.email ? " · " + escHtml(p.email) : ""}${p.location ? " · " + escHtml(p.location.replace(/^◉\s*/, "")) : ""}</p>`
    + `<h2>Summary</h2><p>${escHtml(d.summary)}</p>`
    + `<h2>Skills</h2><p>${escHtml(skills)}</p>`
    + `<h2>Experience</h2>${exps}`
    + `<h2>Education</h2><ul>${(p.education || []).map(x => `<li><b>${escHtml(x.degree)}</b>, ${escHtml(x.school)} (${escHtml(x.years)})</li>`).join("")}</ul>`
    + `<h2>Certifications</h2><ul>${(p.certs || []).map(c => `<li>${escHtml(c.title)} — ${escHtml(c.issuer)}, ${escHtml(c.year)}</li>`).join("")}</ul>`;
}
function buildResumeDoc() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Resume — ${escHtml(PROFILE.name || "")} — ${escHtml(resDraft.title)}</title>`
    + `<style>body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.45;color:#111;max-width:800px;margin:40px auto;padding:0 24px}h1{font-size:20pt;margin:0}h2{font-size:12pt;text-transform:uppercase;border-bottom:1px solid #111;margin:16px 0 6px;padding-bottom:2px}ul{margin:4px 0 4px 18px}li{margin-bottom:3px}p{margin:4px 0}</style></head><body>${buildResumeBody()}</body></html>`;
}
function renderResPreview() { resCollect(); document.getElementById("resPreview").innerHTML = buildResumeBody(); }
function openResume() {
  if (!authed()) { alert("Admin only — unlock the CMS first."); openAdmin(); return; }
  const sel = document.getElementById("resTitle");
  sel.innerHTML = Object.keys(ROLE_PRESETS).map(k => `<option>${k}</option>`).join("");
  const guess = Object.keys(ROLE_PRESETS).find(k => (PROFILE.role || "").toLowerCase().includes(k.split(" ")[0].toLowerCase()));
  sel.value = guess || "Generalist";
  resLoadPreset(sel.value, false);
  document.getElementById("resSummary").value = resDraft.summary;
  document.getElementById("aiKey").value = store.get("sani_ai_key", "");
  resRenderLists(); renderResPreview();
  document.getElementById("resumeModal").classList.add("open");
}
function resClose() { document.getElementById("resumeModal").classList.remove("open"); }
document.getElementById("resumeBtn").addEventListener("click", openResume);
document.getElementById("resumeClose").addEventListener("click", resClose);
document.querySelector('#resumeModal [data-res-close]').addEventListener("click", resClose);
document.getElementById("resTitle").addEventListener("change", e => {
  resLoadPreset(e.target.value, true);
  document.getElementById("resSummary").value = resDraft.summary;
  resRenderLists(); renderResPreview();
});
document.getElementById("resSummary").addEventListener("input", renderResPreview);
document.getElementById("resDuties").addEventListener("change", renderResPreview);
document.getElementById("resExp").addEventListener("change", renderResPreview);
document.getElementById("resAddBullet").addEventListener("click", () => {
  const v = document.getElementById("resCustom").value.trim(); if (!v) return;
  resDraft.bullets.push({ t: v, on: true, custom: true });
  document.getElementById("resCustom").value = "";
  resRenderLists(); renderResPreview();
});
document.getElementById("resDownload").addEventListener("click", () => {
  renderResPreview();
  downloadFile(`resume-${slugify(resDraft.title) || "ats"}.html`, buildResumeDoc(), "text/html");
});
document.getElementById("resPrint").addEventListener("click", () => {
  renderResPreview();
  const w = window.open(URL.createObjectURL(new Blob([buildResumeDoc()], { type: "text/html" })), "_blank");
  if (w) setTimeout(() => { try { w.print(); } catch {} }, 600);
  else alert("Popup blocked — use DOWNLOAD then print the file (Ctrl+P → Save as PDF).");
});
document.getElementById("aiUse").addEventListener("change", e => {
  document.getElementById("aiFields").hidden = !e.target.checked;
});
document.getElementById("aiPolishBtn").addEventListener("click", async () => {
  const key = document.getElementById("aiKey").value.trim();
  const job = document.getElementById("aiJob").value.trim();
  if (!key) return alert("Paste an API key first — it is stored only in this browser.");
  if (!job) return alert("Paste the job posting so the AI has something to match against.");
  store.set("sani_ai_key", key);
  const btn = document.getElementById("aiPolishBtn"); btn.textContent = "✨ WORKING…";
  try {
    resCollect();
    const base = (document.getElementById("aiBase").value.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
    const r = await fetch(base + "/chat/completions", { method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({ model: document.getElementById("aiModel").value.trim() || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You rewrite resumes for ATS parsing and recruiter skimming. Reply ONLY valid JSON: {\"summary\": string, \"bullets\": [6-8 strings]}. Bullets start with strong verbs, keep metrics from context, each under 160 chars, plain text, no markdown." },
          { role: "user", content: "JOB POSTING:\n" + job + "\n\nCURRENT SUMMARY:\n" + resDraft.summary + "\n\nCURRENT BULLETS:\n" + resDraft.bullets.filter(b => b.on).map(b => b.t).join("\n") }
        ] }) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const out = JSON.parse((await r.json()).choices[0].message.content);
    if (out.summary) { resDraft.summary = out.summary; document.getElementById("resSummary").value = out.summary; }
    if (Array.isArray(out.bullets)) out.bullets.forEach(t => { if (t && !resDraft.bullets.some(b => b.t === t)) resDraft.bullets.push({ t: String(t), on: true, custom: true }); });
    resRenderLists(); renderResPreview();
    alert("AI polish applied — review the preview before downloading.");
  } catch (err) { alert("AI polish failed: " + (err.message || err)); }
  btn.textContent = "✨ POLISH WITH AI →";
});

/* ═════════ COMMAND PALETTE (CTRL+K) ═════════ */
const pal = document.getElementById("palette"), palInput = document.getElementById("palInput"), palList = document.getElementById("palList");
let palItems = [], palSel = 0;
function palOpen() { pal.classList.add("open"); pal.setAttribute("aria-hidden", "false"); palInput.value = ""; palRender(""); setTimeout(() => palInput.focus(), 30); }
function palClose() { pal.classList.remove("open"); pal.setAttribute("aria-hidden", "true"); }
function palRender(q) {
  const query = q.trim().toLowerCase();
  const all = [
    ...published().map(p => ({ label: `LOG-${p.num} — ${p.title}`, hint: p.catLabel, run: () => { palClose(); openPost(p.id); } })),
    ...[["#logs", "LOGS"], ["#projects", "STACKS"], ["#signals", "SIGNALS"], ["#about", "OPERATOR"], ["#contact", "CONTACT"]].map(([h, l]) => ({ label: "GO → " + l, hint: "SECTION", run: () => { palClose(); document.querySelector(h).scrollIntoView({ behavior: "smooth" }); } })),
    ...THEMES.map(t => ({ label: "THEME → " + t.name, hint: "THEME", run: () => { setTheme(t.id); palClose(); } })),
    { label: "ADMIN → OPEN CMS", hint: "ACTION", run: () => { palClose(); openAdmin(); } }
  ];
  palItems = all.filter(i => !query || i.label.toLowerCase().includes(query)).slice(0, 12);
  palSel = 0; palPaint();
}
function palPaint() {
  palList.innerHTML = palItems.length ? palItems.map((i, x) =>
    `<div class="pal-item ${x === palSel ? "sel" : ""}" data-px="${x}"><span>→</span><span>${escHtml(i.label)}</span><small>${escHtml(i.hint)}</small></div>`).join("")
    : `<div style="padding:16px;font-family:var(--mono);font-size:12px">No match.</div>`;
  palList.querySelectorAll(".pal-item").forEach(el => el.addEventListener("click", () => palItems[+el.dataset.px].run()));
}
document.getElementById("palBtn").addEventListener("click", palOpen);
palInput.addEventListener("input", () => palRender(palInput.value));
palInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && palItems[palSel]) palItems[palSel].run();
  if (e.key === "ArrowDown") { e.preventDefault(); palSel = Math.min(palSel + 1, palItems.length - 1); palPaint(); }
  if (e.key === "ArrowUp") { e.preventDefault(); palSel = Math.max(palSel - 1, 0); palPaint(); }
});
document.querySelector('#palette [data-pal-close]').addEventListener("click", palClose);
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault(); pal.classList.contains("open") ? palClose() : palOpen();
  }
});

/* ═════════ RSS + SITEMAP EXPORT & SEARCH SHORTCUT ═════════ */
const SITE_URL = "https://arafatsani.com";
const escXml = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function downloadFile(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function buildRSS() {
  const items = published().map(p => `
    <item><title>${escXml(p.title)}</title><link>${SITE_URL}/?log=${p.id}</link><guid>${SITE_URL}/?log=${p.id}</guid><pubDate>${escXml(p.date)}</pubDate><description>${escXml(p.excerpt)}</description><category>${escXml(p.catLabel)}</category></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>SANI.LOG — Infrastructure Intelligence Hub</title><link>${SITE_URL}</link><description>Field notes on AI infrastructure, inference, MLOps, cloud and platform engineering.</description>${items}</channel></rss>`;
}
function buildSitemap() {
  const urls = [`<url><loc>${SITE_URL}/</loc></url>`, ...published().map(p => `<url><loc>${SITE_URL}/?log=${p.id}</loc></url>`)];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
}
document.getElementById("rssBtn").addEventListener("click", e => { e.preventDefault(); downloadFile("sani-log-rss.xml", buildRSS(), "application/rss+xml"); });
document.getElementById("sitemapBtn").addEventListener("click", e => { e.preventDefault(); downloadFile("sitemap.xml", buildSitemap(), "application/xml"); });
document.addEventListener("keydown", e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
  if (e.key === "/" && !typing && !modal.classList.contains("open") && !drawer.classList.contains("open") && !pal.classList.contains("open")) {
    e.preventDefault(); document.getElementById("searchInput").focus();
    document.getElementById("logs").scrollIntoView({ behavior: "smooth" });
  }
});

/* init */
renderThemes(); sbInit(); autoPublish(); renderAll(); paintAdminGated();
try {
  const deep = new URLSearchParams(location.search).get("log");
  if (deep && published().some(p => p.id === deep)) openPost(deep);
} catch {}
document.querySelectorAll(".proj-card,.trend-row").forEach(el => { el.classList.add("reveal"); rio.observe(el); });
