<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';
import { Typography } from '@/components/Typography';
import UsersTable from '@/features/users/components/UsersTable.vue';

const { t } = useLocale();
</script>

<template>
  <div class="space-y-6">
    <div>
      <Typography.Title :level="2">
        {{ t('nav.users') }}
      </Typography.Title>
      <Typography.Text
        color="muted"
        class="mt-1 block"
      >
        {{ t('users.subtitle') }}
      </Typography.Text>
    </div>

    <UsersTable />
  </div>
</template>
