<script lang="ts">
  import { page } from '$app/stores'
  const { error } = $page

  const handledErrors: { [key: string]: { title: string; message: string }} = {
    'Not Found': {
      title: 'Not Found',
      message: 'The page you are looking for does not exist.',
    },
    'Default': {
      title: 'Yikes :(',
      message: 'An error occurred while loading the page. Try again, or use the navigation to get back on track.',
    },
  }

  const errorMessaging = handledErrors[error?.message || 'Default'] || handledErrors['Default']
</script>

<div class="flex w-full h-full flex-col gap-4 items-center justify-center">
  <h1 class="text-4xl font-bold m-0 p-0">{errorMessaging.title}</h1>
  <p class="text-xl">{errorMessaging.message}</p>
  <nav class="flex gap-8 text-xl text-indigo-600 mt-4">
    <a href="/">Home</a>
    <a href="/docs">Docs</a>
    <a href="https://github.com/cryptidsxyz/cmtcg">Github</a>
    <a href="/game">Play</a>
  </nav>
</div>