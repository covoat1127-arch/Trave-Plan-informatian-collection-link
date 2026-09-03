'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react';

type Answers = Record<string, string | string[] | boolean>;
const steps = [
  ['01 / 06', '旅程轮廓', '先让我们了解这次出发的基本信息。'],
  ['02 / 06', '目的与节奏', '定义旅程应该带给你的感受。'],
  ['03 / 06', '交通与居停', '把舒适落实到每一次移动与停留。'],
  ['04 / 06', '餐饮与照护', '记录口味、禁忌与需要被照顾的细节。'],
  ['05 / 06', '文化与影像', '为专属手册与旅后影像确定表达方向。'],
  ['06 / 06', '确认与提交', '最后核对重要偏好，我们将据此开启策划。'],
];
const initial: Answers = { rooms: '1', consent: false };

function Field({ label, name, value, onChange, required, type = 'text', placeholder = '' }: { label: string; name: string; value: string; onChange: (n: string, v: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return <label className="field"><span>{label}{required && <em>必填</em>}</span><input name={name} type={type} value={value} onChange={e => onChange(name, e.target.value)} placeholder={placeholder} required={required} /></label>;
}
function TextArea({ label, name, value, onChange, placeholder = '' }: { label: string; name: string; value: string; onChange: (n: string, v: string) => void; placeholder?: string }) {
  return <label className="field full"><span>{label}</span><textarea name={name} value={value} onChange={e => onChange(name, e.target.value)} placeholder={placeholder} rows={4} /></label>;
}
function Choices({ label, name, options, answers, setAnswer, multi = false }: { label: string; name: string; options: string[]; answers: Answers; setAnswer: (n: string, v: string | string[]) => void; multi?: boolean }) {
  const current = answers[name];
  const select = (option: string) => {
    if (!multi) return setAnswer(name, option);
    const list = Array.isArray(current) ? current : [];
    setAnswer(name, list.includes(option) ? list.filter(x => x !== option) : [...list, option]);
  };
  return <div className="choice-block full"><span className="choice-label">{label}</span><div className="chips">{options.map(option => { const active = Array.isArray(current) ? current.includes(option) : current === option; return <button type="button" key={option} className={active ? 'chip active' : 'chip'} onClick={() => select(option)} aria-pressed={active}>{active && <Check size={14} />}{option}</button>; })}</div></div>;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initial);
  const [status, setStatus] = useState<'idle'|'sending'|'done'|'error'>('idle');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { try { const saved = localStorage.getItem('gcz-journey-draft'); if (saved) setAnswers({ ...initial, ...JSON.parse(saved) }); } catch {} }, []);
  useEffect(() => { if (status !== 'done') localStorage.setItem('gcz-journey-draft', JSON.stringify(answers)); }, [answers, status]);
  const setAnswer = (name: string, value: string | string[] | boolean) => setAnswers(a => ({ ...a, [name]: value }));
  const val = (name: string) => String(answers[name] ?? '');
  const canNext = useMemo(() => step !== 0 || Boolean(val('clientName') && val('contact') && val('departure') && val('destination') && val('startDate') && val('endDate')), [step, answers]);
  async function submit() {
    if (!answers.consent) { setError('请先确认隐私与服务声明。'); return; }
    setStatus('sending'); setError('');
    try {
      const response = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(answers) });
      const result = await response.json() as { error?: string; reference?: string };
      if (!response.ok) throw new Error(result.error || '提交失败');
      setReference(result.reference || '已受理'); setStatus('done'); localStorage.removeItem('gcz-journey-draft');
    } catch (e) { setStatus('error'); setError(e instanceof Error ? e.message : '提交未完成，请稍后重试。'); }
  }
  if (status === 'done') return <main className="site-shell success-shell"><section className="success-card"><img src="/brand-logo.png" alt="观策·帧" /><div className="success-mark"><Check /></div><p className="kicker">SUBMISSION RECEIVED</p><h1>感谢你的信任</h1><p>旅程顾问将以你填写的信息为起点，整理首轮策划思路并与你联系。</p><div className="reference"><span>专属受理编号</span><strong>{reference}</strong></div><small>世界在变，你的从容不变。</small></section></main>;
  return <main className="site-shell">
    <aside className="brand-panel"><div className="brand-lockup"><img src="/brand-logo.png" alt="观策·帧品牌标志" /><div><strong>观策·帧</strong><span>GUAN CE · ZHEN</span></div></div><div className="brand-copy"><p className="kicker">PRIVATE JOURNEY PROFILE</p><h1>在启程之前，<br/>先读懂你的期待。</h1><p>这不是一份标准化订单，而是我们为你建立专属旅程档案的开始。</p></div><div className="privacy-note"><ShieldCheck size={18}/><span>仅用于本次旅程策划与服务沟通<br/>草稿自动保存在当前设备</span></div><p className="slogan">世界在变，你的从容不变。</p></aside>
    <section className="form-panel"><header className="mobile-brand"><div className="brand-lockup"><img src="/brand-logo.png" alt="观策·帧" /><div><strong>观策·帧</strong><span>PRIVATE JOURNEY</span></div></div><span>{step + 1} / {steps.length}</span></header><div className="progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><div className="form-wrap"><div className="step-heading"><p>{steps[step][0]}</p><h2>{steps[step][1]}</h2><span>{steps[step][2]}</span></div><div className="fields">
      {step === 0 && <><Field label="称呼" name="clientName" value={val('clientName')} onChange={setAnswer} required placeholder="如：陈先生 / 林女士"/><Field label="联系方式" name="contact" value={val('contact')} onChange={setAnswer} required placeholder="微信、手机或邮箱"/><Field label="出发城市 / 机场" name="departure" value={val('departure')} onChange={setAnswer} required placeholder="如：成都双流"/><Field label="目的地" name="destination" value={val('destination')} onChange={setAnswer} required placeholder="城市或国家"/><Field label="出发日期" name="startDate" value={val('startDate')} onChange={setAnswer} required type="date"/><Field label="返程日期" name="endDate" value={val('endDate')} onChange={setAnswer} required type="date"/><Field label="出行人员" name="travellers" value={val('travellers')} onChange={setAnswer} placeholder="如：2位成人、1位儿童（8岁）"/><Field label="房间数量" name="rooms" value={val('rooms')} onChange={setAnswer} type="number"/><Field label="预算范围" name="budget" value={val('budget')} onChange={setAnswer} placeholder="总预算或人均预算均可"/><Choices label="日期弹性" name="dateFlexibility" options={['日期固定','前后可调整1–2天','可由顾问建议']} answers={answers} setAnswer={setAnswer}/></>}
      {step === 1 && <><Choices label="本次旅程目的（可多选）" name="purpose" options={['商务会议','客户接待','奖励旅行','私人度假','纪念日','文化探索','身心休息']} answers={answers} setAnswer={setAnswer} multi/><Choices label="理想旅行节奏" name="pace" options={['舒缓留白','松弛适中','高效充实','由顾问平衡']} answers={answers} setAnswer={setAnswer}/><Choices label="通常愿意几点开始一天" name="startTime" options={['08:00前','09:00左右','10:00后','视当天安排']} answers={answers} setAnswer={setAnswer}/><Choices label="步行接受程度" name="walking" options={['轻量','适中','乐于深度步行','需要无障碍照护']} answers={answers} setAnswer={setAnswer}/><TextArea label="希望这趟旅程带给你的感受" name="desiredFeeling" value={val('desiredFeeling')} onChange={setAnswer} placeholder="例如：从容、高效、被照顾、真正理解一座城市……"/><TextArea label="商务日程或必须保留的时间" name="fixedSchedule" value={val('fixedSchedule')} onChange={setAnswer} placeholder="请写明日期、时间与地点；暂无可留空"/></>}
      {step === 2 && <><Choices label="舱位偏好" name="cabin" options={['经济舱','超级经济舱','公务舱','头等舱','视航程建议']} answers={answers} setAnswer={setAnswer}/><Choices label="航班偏好" name="flightPreference" options={['只选直飞','可接受一次中转','时间优先','舒适度优先','性价比优先']} answers={answers} setAnswer={setAnswer} multi/><Choices label="当地交通" name="localTransport" options={['专车全程','重要节点专车','铁路/公共交通体验','由顾问组合']} answers={answers} setAnswer={setAnswer}/><Choices label="酒店风格（可多选）" name="hotelStyle" options={['经典奢华','现代设计','精品酒店','文化遗产','度假疗愈','品牌国际化']} answers={answers} setAnswer={setAnswer} multi/><Field label="常用航空 / 酒店会籍" name="memberships" value={val('memberships')} onChange={setAnswer} placeholder="品牌及等级，可选填"/><Field label="房型与床型偏好" name="roomPreference" value={val('roomPreference')} onChange={setAnswer} placeholder="大床/双床/套房/景观等"/><TextArea label="行李、接送机及其他移动需求" name="mobilityNotes" value={val('mobilityNotes')} onChange={setAnswer} placeholder="例如：大件行李、贵宾通道、儿童座椅……"/></>}
      {step === 3 && <><Choices label="餐饮期待（可多选）" name="dining" options={['当地代表料理','米其林/黑珍珠','私房与主厨餐桌','熟悉的中式口味','健康轻食','氛围优先']} answers={answers} setAnswer={setAnswer} multi/><Choices label="每日用餐节奏" name="mealRhythm" options={['三餐完整安排','重点安排晚餐','保留自由探索','由顾问建议']} answers={answers} setAnswer={setAnswer}/><TextArea label="过敏、宗教禁忌与健康需求" name="healthDiet" value={val('healthDiet')} onChange={setAnswer} placeholder="没有请填写“无”；我们会将此作为重要服务信息"/><TextArea label="喜欢与不喜欢的口味" name="tasteNotes" value={val('tasteNotes')} onChange={setAnswer} placeholder="辣度、酒水、咖啡、早餐习惯等"/><TextArea label="值得特别庆祝或被记住的时刻" name="celebration" value={val('celebration')} onChange={setAnswer} placeholder="纪念日、生日、客户宴请或其他仪式"/></>}
      {step === 4 && <><Choices label="文化兴趣（可多选）" name="cultureInterests" options={['历史脉络','建筑与城市','艺术与设计','宗教与哲思','商业与产业','饮食文化','自然与生态']} answers={answers} setAnswer={setAnswer} multi/><Choices label="旅行前手册的阅读深度" name="handbookDepth" options={['10分钟速读','重点背景导读','深度文化叙事','分层阅读版本']} answers={answers} setAnswer={setAnswer}/><Choices label="影像记录重点（可多选）" name="photoFocus" options={['自然纪实','人物肖像','商务场景','同行关系','城市与建筑','细节与氛围']} answers={answers} setAnswer={setAnswer} multi/><Choices label="旅后专属册偏好" name="albumStyle" options={['经典收藏册','现代画册','叙事纪行','商务纪念册','由设计师提案']} answers={answers} setAnswer={setAnswer}/><TextArea label="特别想了解的地点、人物或议题" name="cultureNotes" value={val('cultureNotes')} onChange={setAnswer} placeholder="也可以写下不希望出现的内容"/><TextArea label="拍摄边界与隐私要求" name="photoPrivacy" value={val('photoPrivacy')} onChange={setAnswer} placeholder="如：不可公开、避免正脸、商务会议不拍摄等"/></>}
      {step === 5 && <><div className="summary full"><Sparkles size={18}/><div><strong>你的专属旅程档案即将建立</strong><p>{val('departure') || '出发地待定'} → {val('destination') || '目的地待定'} · {val('startDate') || '日期待定'} 至 {val('endDate') || '日期待定'}</p></div></div><Choices label="最看重的服务感受（可多选）" name="servicePriority" options={['响应迅速','行程从容','文化深度','私密安全','审美品质','灵活应变']} answers={answers} setAnswer={setAnswer} multi/><Field label="紧急联系人（选填）" name="emergencyContact" value={val('emergencyContact')} onChange={setAnswer} placeholder="姓名、关系及联系方式"/><Field label="旅行保险状态" name="insurance" value={val('insurance')} onChange={setAnswer} placeholder="已购买 / 希望协助 / 暂不需要"/><TextArea label="其他希望我们提前知道的事" name="otherNotes" value={val('otherNotes')} onChange={setAnswer} placeholder="任何小事，都可能让旅程更贴合你。"/><label className="consent full"><input type="checkbox" checked={Boolean(answers.consent)} onChange={e => setAnswer('consent', e.target.checked)}/><span>我确认以上信息真实，并同意观策·帧仅为本次咨询、旅程策划与服务沟通使用这些信息。涉及健康、饮食或紧急联络的信息仅在服务所需范围内处理。</span></label></>}
    </div>{error && <p className="error" role="alert">{error}</p>}<footer className="form-actions"><button className="back" type="button" onClick={() => { setError(''); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}><ArrowLeft size={17}/>上一步</button>{step < steps.length - 1 ? <button className="next" type="button" disabled={!canNext} onClick={() => { if (!canNext) { setError('请先完成本页必填项。'); return; } setError(''); setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>下一步<ArrowRight size={17}/></button> : <button className="next" type="button" disabled={status === 'sending'} onClick={submit}>{status === 'sending' ? '正在提交…' : '确认并提交'}<ArrowRight size={17}/></button>}</footer></div></section>
  </main>;
}
