import {Fragment,useCallback,useContext,useEffect} from "react"
import {Button as RadixThemesButton,Container as RadixThemesContainer,Flex as RadixThemesFlex,Heading as RadixThemesHeading,Link as RadixThemesLink,Select as RadixThemesSelect,Separator as RadixThemesSeparator,Table as RadixThemesTable,Text as RadixThemesText,TextField as RadixThemesTextField} from "@radix-ui/themes"
import DebounceInput from "react-debounce-input"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isNotNullOrUndefined,isTrue} from "$/utils/state"
import {Link as ReactRouterLink} from "react-router"
import {jsx} from "@emotion/react"




function Debounceinput_3107229689bb51af7b394279f45a5bf3 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_b9d09f7b4400829a3cce0129a3137c71 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_professional_name", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_b9d09f7b4400829a3cce0129a3137c71,placeholder:"Professional Name",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.professional_name_rx_state_) ? reflex___state____state__src___frontend___state____state.professional_name_rx_state_ : "")},)
  )
}


function Button_f0ad64a3117273b33e1d7c8b4a0744bc () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_79c8e2324af862774e3e640b86087f57 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.add_professional", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{onClick:on_click_79c8e2324af862774e3e640b86087f57},"Add")
  )
}


function Select__group_0d016535312c18f899f6d9dad796018e () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(RadixThemesSelect.Group,{},"",Array.prototype.map.call(reflex___state____state__src___frontend___state____state.professional_names_rx_state_ ?? [],((item_rx_state_,index_a4c056de887ac0859af139cad1744de9)=>(jsx(RadixThemesSelect.Item,{key:index_a4c056de887ac0859af139cad1744de9,value:item_rx_state_},item_rx_state_)))))
  )
}


function Select__root_a0e167a9c21e417ea784de40b61cba47 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_5ed3becb3af7740f32aedeaf6754b45c = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_selected_professional_by_name", ({ ["name"] : _ev_0 }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesSelect.Root,{onValueChange:on_change_5ed3becb3af7740f32aedeaf6754b45c},jsx(RadixThemesSelect.Trigger,{placeholder:"Select Professional"},),jsx(RadixThemesSelect.Content,{},jsx(Select__group_0d016535312c18f899f6d9dad796018e,{},)))
  )
}


function Debounceinput_6b23d3d195a852871eeab0f1819ef06f () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_a1fc7dd19ebc627f2445a79a0955df88 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_unavailability_year", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_a1fc7dd19ebc627f2445a79a0955df88,placeholder:"Year",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.unavailability_year_rx_state_) ? reflex___state____state__src___frontend___state____state.unavailability_year_rx_state_ : "")},)
  )
}


function Debounceinput_7f07690ae56f9fffb38dea7893ad3d1d () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_9fd566888bac887e4ea35c15e725cbfe = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_unavailability_month", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_9fd566888bac887e4ea35c15e725cbfe,placeholder:"Month",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.unavailability_month_rx_state_) ? reflex___state____state__src___frontend___state____state.unavailability_month_rx_state_ : "")},)
  )
}


function Debounceinput_56959c35b6e610eece9e60dfb31ef957 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_1cbc20dd3abf8f68e989ffd8dc826d2f = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_unavailability_day", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_1cbc20dd3abf8f68e989ffd8dc826d2f,placeholder:"Day",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.unavailability_day_rx_state_) ? reflex___state____state__src___frontend___state____state.unavailability_day_rx_state_ : "")},)
  )
}


function Select__root_5697896f6e25638d27e0b5df78dfded6 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_03682bb4da43c8ad3f2de48c73d396c9 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_unavailability_shift_type", ({ ["value"] : _ev_0 }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesSelect.Root,{onValueChange:on_change_03682bb4da43c8ad3f2de48c73d396c9,value:reflex___state____state__src___frontend___state____state.unavailability_shift_type_rx_state_},jsx(RadixThemesSelect.Trigger,{},),jsx(RadixThemesSelect.Content,{},jsx(RadixThemesSelect.Group,{},"",jsx(RadixThemesSelect.Item,{value:"morning"},"morning"),jsx(RadixThemesSelect.Item,{value:"night"},"night"))))
  )
}


function Button_3133f51751eb2a58c0035d0b5903d590 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_cdb0d23094638ca08c27c23f14d44751 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.add_unavailability", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{onClick:on_click_cdb0d23094638ca08c27c23f14d44751},"Add Unavailability")
  )
}


function Debounceinput_87f43ba32eb69d59616a8a75fa687e63 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_c56932bb65fc6f485ce8ecea7e50a658 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_schedule_start_year", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_c56932bb65fc6f485ce8ecea7e50a658,placeholder:"Year",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.schedule_start_year_rx_state_) ? reflex___state____state__src___frontend___state____state.schedule_start_year_rx_state_ : "")},)
  )
}


function Debounceinput_e6ccc17696065dc702bc47eea78732ea () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_801c8917a9de7a892d05e4f80948c2b4 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_schedule_start_month", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_801c8917a9de7a892d05e4f80948c2b4,placeholder:"Month",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.schedule_start_month_rx_state_) ? reflex___state____state__src___frontend___state____state.schedule_start_month_rx_state_ : "")},)
  )
}


function Debounceinput_174017ff01be305ad9c798f3ae39c46f () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_bf8840c426f0a5f20ee886c12cd0f3a2 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_schedule_start_day", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_bf8840c426f0a5f20ee886c12cd0f3a2,placeholder:"Day",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.schedule_start_day_rx_state_) ? reflex___state____state__src___frontend___state____state.schedule_start_day_rx_state_ : "")},)
  )
}


function Debounceinput_c23672c59af711a526de8cdf823dd6f9 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_2a1ca9bb3aa95e9302e5986a20c4f880 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_schedule_end_year", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_2a1ca9bb3aa95e9302e5986a20c4f880,placeholder:"Year",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.schedule_end_year_rx_state_) ? reflex___state____state__src___frontend___state____state.schedule_end_year_rx_state_ : "")},)
  )
}


function Debounceinput_216df23f8db0fd6a2666f52e3aef602e () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_3afe11b8bed5586e2d90db807115a30a = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_schedule_end_month", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_3afe11b8bed5586e2d90db807115a30a,placeholder:"Month",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.schedule_end_month_rx_state_) ? reflex___state____state__src___frontend___state____state.schedule_end_month_rx_state_ : "")},)
  )
}


function Debounceinput_f1345a3ecba488c456b973b72e3e115a () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_b001d055f30cd5c51da342bac1dffd57 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_schedule_end_day", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_b001d055f30cd5c51da342bac1dffd57,placeholder:"Day",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.schedule_end_day_rx_state_) ? reflex___state____state__src___frontend___state____state.schedule_end_day_rx_state_ : "")},)
  )
}


function Debounceinput_237a609ce731de714bf986819e84deb7 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_d444b04e25c6441386e388d44f16aeef = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_morning_weekday", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_d444b04e25c6441386e388d44f16aeef,placeholder:"Morning Weekday",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.morning_weekday_rx_state_) ? reflex___state____state__src___frontend___state____state.morning_weekday_rx_state_ : "")},)
  )
}


function Debounceinput_b41b4913a3baaefe6a1fdef835c46a5a () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_e66f8f669a7661eb13e43a3915e6a887 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_night_weekday", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_e66f8f669a7661eb13e43a3915e6a887,placeholder:"Night Weekday",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.night_weekday_rx_state_) ? reflex___state____state__src___frontend___state____state.night_weekday_rx_state_ : "")},)
  )
}


function Debounceinput_dd9a7c5d214d29de838636bd2c25d844 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_eb39193a10de96c46676dfeff3d5b08a = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_morning_weekend", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_eb39193a10de96c46676dfeff3d5b08a,placeholder:"Morning Weekend",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.morning_weekend_rx_state_) ? reflex___state____state__src___frontend___state____state.morning_weekend_rx_state_ : "")},)
  )
}


function Debounceinput_6c0dea9305f98c540e67be48e2f36fff () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_88ccf26238863189a7e2d2e792b50437 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.set_night_weekend", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_88ccf26238863189a7e2d2e792b50437,placeholder:"Night Weekend",type:"number",value:(isNotNullOrUndefined(reflex___state____state__src___frontend___state____state.night_weekend_rx_state_) ? reflex___state____state__src___frontend___state____state.night_weekend_rx_state_ : "")},)
  )
}


function Button_a54e1ec393d9808f2640486d3bd31624 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_bff2d425a83b3ee8555372417ac0561d = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.generate_schedule", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{onClick:on_click_bff2d425a83b3ee8555372417ac0561d},"Generate Schedule")
  )
}


function Link_d0f5f8b604baf5a83b99d895e81a95d2 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{download:"schedule.csv",target:(true ? "_blank" : ""),to:reflex___state____state__src___frontend___state____state.download_url_rx_state_},jsx(RadixThemesButton,{},"Download Schedule")))
  )
}


function Fragment_8f63d09d6b446d7b574c0b3b73aff9d3 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__src___frontend___state____state.download_url_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Link_d0f5f8b604baf5a83b99d895e81a95d2,{},))):(jsx(Fragment,{},))))
  )
}


function Text_437f8582aec85dda4c1a78591c1fcfb1 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(RadixThemesText,{as:"p"},reflex___state____state__src___frontend___state____state.schedule_message_rx_state_)
  )
}


function Fragment_e334a92c8b904774a980ee629b1c4f5a () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__src___frontend___state____state.schedule_message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_437f8582aec85dda4c1a78591c1fcfb1,{},))):(jsx(Fragment,{},))))
  )
}


function Table__body_5292df9d868cb621e7f3cc9072d0893b () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(RadixThemesTable.Body,{},Array.prototype.map.call(reflex___state____state__src___frontend___state____state.summary_statistics_rx_state_ ?? [],((stat_rx_state_,index_012615a807980642f618ec17f76366e3)=>(jsx(RadixThemesTable.Row,{key:index_012615a807980642f618ec17f76366e3},jsx(RadixThemesTable.Cell,{},stat_rx_state_?.["name"]),jsx(RadixThemesTable.Cell,{},stat_rx_state_?.["morning"]),jsx(RadixThemesTable.Cell,{},stat_rx_state_?.["night"]),jsx(RadixThemesTable.Cell,{},stat_rx_state_?.["total"]))))))
  )
}


function Fragment_2d2f22c7aedf37eec3afcb281e159066 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(Fragment,{},((reflex___state____state__src___frontend___state____state.summary_statistics_rx_state_.length > 0)?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"column",gap:"3"},jsx(RadixThemesHeading,{size:"7"},"Summary Statistics"),jsx(RadixThemesTable.Root,{},jsx(RadixThemesTable.Header,{},jsx(RadixThemesTable.Row,{},jsx(RadixThemesTable.ColumnHeaderCell,{},"Professional"),jsx(RadixThemesTable.ColumnHeaderCell,{},"Morning Shifts"),jsx(RadixThemesTable.ColumnHeaderCell,{},"Night Shifts"),jsx(RadixThemesTable.ColumnHeaderCell,{},"Total Shifts"))),jsx(Table__body_5292df9d868cb621e7f3cc9072d0893b,{},))))):(jsx(Fragment,{},))))
  )
}


function Flex_1afac06fa130c3d75169988df2c96576 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"column",gap:"3"},jsx(RadixThemesHeading,{size:"6"},"Unassigned Shifts"),Array.prototype.map.call(reflex___state____state__src___frontend___state____state.unassigned_shifts_rx_state_ ?? [],((s_rx_state_,index_30f480d96fe125fa3cfda5667655d09f)=>(jsx(RadixThemesText,{as:"p",key:index_30f480d96fe125fa3cfda5667655d09f},(s_rx_state_?.["date"]+" - "+s_rx_state_?.["shift_type"]+" (needs "+s_rx_state_?.["required_staff"]+")"))))))
  )
}


function Fragment_ab4af865ff21e46c88d6d5e10b41bfe3 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)



  return (
    jsx(Fragment,{},((reflex___state____state__src___frontend___state____state.unassigned_shifts_rx_state_.length > 0)?(jsx(Fragment,{},jsx(Flex_1afac06fa130c3d75169988df2c96576,{},))):(jsx(Fragment,{},))))
  )
}


function Flex_7a8b3051384bac8d540b375805e0aa62 () {
  const reflex___state____state__src___frontend___state____state = useContext(StateContexts.reflex___state____state__src___frontend___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesHeading,{size:"9"},"Shift Scheduler"),jsx(RadixThemesSeparator,{size:"4"},),jsx(RadixThemesHeading,{size:"7"},"Add Professionals"),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(Debounceinput_3107229689bb51af7b394279f45a5bf3,{},),jsx(Button_f0ad64a3117273b33e1d7c8b4a0744bc,{},)),Array.prototype.map.call(reflex___state____state__src___frontend___state____state.professionals_rx_state_ ?? [],((prof_rx_state_,index_0a24cf55c4314267916b2500cdf49470)=>(jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",key:index_0a24cf55c4314267916b2500cdf49470,gap:"3"},jsx(RadixThemesText,{as:"p"},prof_rx_state_?.["name"]),jsx(RadixThemesButton,{color:"red",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.remove_professional", ({ ["prof_id"] : prof_rx_state_?.["id"] }), ({  })))], [_e], ({  }))))},"Remove"))))),jsx(RadixThemesSeparator,{size:"4"},),jsx(RadixThemesHeading,{size:"7"},"Add Unavailability"),jsx(Select__root_a0e167a9c21e417ea784de40b61cba47,{},),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(Debounceinput_6b23d3d195a852871eeab0f1819ef06f,{},),jsx(Debounceinput_7f07690ae56f9fffb38dea7893ad3d1d,{},),jsx(Debounceinput_56959c35b6e610eece9e60dfb31ef957,{},)),jsx(Select__root_5697896f6e25638d27e0b5df78dfded6,{},),jsx(Button_3133f51751eb2a58c0035d0b5903d590,{},),Array.prototype.map.call(reflex___state____state__src___frontend___state____state.unavailabilities_rx_state_ ?? [],((u_rx_state_,index_rx_state_)=>(jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",key:index_rx_state_,gap:"3"},jsx(RadixThemesText,{as:"p"},(u_rx_state_?.["professional_name"]+" - "+u_rx_state_?.["date"]+" - "+u_rx_state_?.["shift_type"])),jsx(RadixThemesButton,{color:"red",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.src___frontend___state____state.remove_unavailability", ({ ["index"] : index_rx_state_ }), ({  })))], [_e], ({  }))))},"Remove"))))),jsx(RadixThemesSeparator,{size:"4"},),jsx(RadixThemesHeading,{size:"7"},"Schedule Configuration"),jsx(RadixThemesText,{as:"p"},"Start Date:"),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(Debounceinput_87f43ba32eb69d59616a8a75fa687e63,{},),jsx(Debounceinput_e6ccc17696065dc702bc47eea78732ea,{},),jsx(Debounceinput_174017ff01be305ad9c798f3ae39c46f,{},)),jsx(RadixThemesText,{as:"p"},"End Date:"),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(Debounceinput_c23672c59af711a526de8cdf823dd6f9,{},),jsx(Debounceinput_216df23f8db0fd6a2666f52e3aef602e,{},),jsx(Debounceinput_f1345a3ecba488c456b973b72e3e115a,{},)),jsx(RadixThemesText,{as:"p"},"Staff Requirements:"),jsx(RadixThemesText,{as:"p"},"Weekdays"),jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"2"},jsx(RadixThemesText,{as:"label"},"Day Shift:"),jsx(Debounceinput_237a609ce731de714bf986819e84deb7,{},),jsx(RadixThemesText,{as:"label"},"Night Shift:"),jsx(Debounceinput_b41b4913a3baaefe6a1fdef835c46a5a,{},)),jsx(RadixThemesText,{as:"p"},"Weekends"),jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"2"},jsx(RadixThemesText,{as:"label"},"Day Shift:"),jsx(Debounceinput_dd9a7c5d214d29de838636bd2c25d844,{},),jsx(RadixThemesText,{as:"label"},"Night Shift:"),jsx(Debounceinput_6c0dea9305f98c540e67be48e2f36fff,{},)),jsx(Button_a54e1ec393d9808f2640486d3bd31624,{},),jsx(Fragment_8f63d09d6b446d7b574c0b3b73aff9d3,{},),jsx(Fragment_e334a92c8b904774a980ee629b1c4f5a,{},),jsx(RadixThemesSeparator,{size:"4"},),jsx(Fragment_2d2f22c7aedf37eec3afcb281e159066,{},),jsx(RadixThemesSeparator,{size:"4"},),jsx(RadixThemesHeading,{size:"7"},"Assignments"),Array.prototype.map.call(reflex___state____state__src___frontend___state____state.assignments_rx_state_ ?? [],((a_rx_state_,index_d1bb23344ccc7f0a8c25f619a36287ae)=>(jsx(RadixThemesText,{as:"p",key:index_d1bb23344ccc7f0a8c25f619a36287ae},(a_rx_state_?.["professional_name"]+" - "+a_rx_state_?.["shift_date"]+" - "+a_rx_state_?.["shift_type"]))))),jsx(Fragment_ab4af865ff21e46c88d6d5e10b41bfe3,{},))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesContainer,{css:({ ["padding"] : "4" }),size:"3"},jsx(Flex_7a8b3051384bac8d540b375805e0aa62,{},)),jsx("title",{},"App | Index"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}