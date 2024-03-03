import { defineComponent, ref, type SetupContext } from 'vue'

export const App = defineComponent(() => {
  return () => <HelloWorld />
})

type Log = {
  message: string
  timestamp: number
}

export const HelloWorld = defineComponent(() => {
  const a = ref(1)
  const toLog = ref<Log[]>([])
  const log = (msg: string) => {
    toLog.value.push({ message: msg, timestamp: Date.now() })
    setTimeout(() => {
      toLog.value.shift()
    }, 1000)
  }

  return () => (
    <div>
      <h1>Hello, World! - {a.value === 1 ? 'if' : 'else'}</h1>

      {/* Resolve types resolves runtime emits to ['log'] instead of { log: (msg: string) => void } making msg 'any' */}
      <LogInput onLog={(msg) => log(msg)} />

      {/* vModel property is not known - but works */}
      <LogMessages
        vModel={toLog.value}
        // v-model={toLog.value} - works, untyped due to it being looked up on intrinsic attributes and it having a fallthrough case
      />

      {/* Works and is typed */}
      <LogMessages
        onUpdate:modelValue={(e) => (toLog.value = e)}
        modelValue={toLog.value}
        //class is not found
        class={{
          'log-messages': true
        }}
      />
    </div>
  )
})

const LogInput = defineComponent(
  (
    _,
    { emit }: SetupContext<{ log: (msg: string) => void }>
    // { emit }: { emit: { log: (msg: string) => void } } - no difference in typing
  ) => {
    const input = ref('')
    const log = (msg: string) => {
      emit('log', msg)
    }

    return () => (
      <div>
        <input
          vModel={input.value}
          onKeydown={(e) => {
            if (e.key === 'Enter') {
              log(input.value)
              input.value = ''
            }
          }}
        />
      </div>
    )
  }
  // #Expected:
  // {
  //   emits: {
  //     log: (msg: string) => true
  //   }
  // }

  // #Received:
  // {
  //   emits: ['log']
  // }
)

const LogMessages = defineComponent(
  (
    props: { modelValue: Log[] },
    { emit, attrs }
    // : { emit: { updateModelValue: (value: Log[]) => void }; attrs: HTMLAttributes } - unable to type it
  ) => {
    const removeLog = (index: number) => {
      props.modelValue.splice(index, 1)
      emit('update:modelValue', props.modelValue)
    }

    return () => (
      <div {...attrs}>
        {props.modelValue.map((log) => (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div key={log.timestamp}>{log.message}</div>
            <button onClick={() => removeLog(props.modelValue.indexOf(log))}>X</button>
          </div>
        ))}
      </div>
    )
  },
  {
    emits: {
      'update:modelValue': (value: Log[]) => {
        return value
      }
    },
    inheritAttrs: true
  }
)
