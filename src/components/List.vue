<template>
    <q-list bordered>
        <div  v-for="(categoria, i) in lista" :key="i">
            
            <q-separator />
            <q-item-label header class="bg-teal-1">
                <i :class="categoria.icon"></i> {{categoria.categoria}}
            </q-item-label>
            <q-separator />
            
            <q-item clickable v-ripple  v-for="(item, j) in categoria.produtos" :key="j">
                <q-item-section avatar >
                     <div class="text-grey-8 q-gutter-xs">
                        <q-btn size="12px" flat dense round icon="more_vert" >
                            <q-menu
                                transition-show="flip-right"
                                transition-hide="flip-left"
                            >
                                <q-list style="min-width: 100px">
                                    <q-item clickable>
                                        <q-item-section @click="editar(item)"  v-close-popup>
                                            Editar
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable @click="apagar(item.id)"  v-close-popup>
                                        <q-item-section>
                                            Apagar
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </div>
                    
                </q-item-section>         
                <q-item-section>
                    {{ item.produto }}
                </q-item-section>

                <q-item-section avatar >

                     {{ item.quantidade }}
                </q-item-section>
                       
            </q-item>
        </div>
        
    </q-list>
    
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'List',
    props: {
        lista: {
            type: Array,
            required: true
        }
    },
    methods: {
        editar: function(value) {
            this.$emit('clickEditar', value);
        },

        apagar: function(value) {
            this.$emit('clickApagar', value);
        }
    }
})
</script>
