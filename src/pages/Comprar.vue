<template>
    <q-card class="my-card q-mb-md" v-if="form_compra">
        <q-card-section>
            <div class="text-h6 text-center">Iniciar Compra</div>
        </q-card-section>
        <q-card-section>
            <q-form ref="formulario"> 
                <q-input 
                    rounded outlined 
                    v-model="nome_supermercado" 
                    label="Nome do Supermercado"  
                    class="q-mb-sm"
                    :rules="[val => !!val || 'Este campo é obrigatório']"  
                />
            </q-form>
            <q-btn :loading="loading"  class="full-width" icon-right="send" label="Iniciar" color="primary" @click="iniciarCompra"/>
        </q-card-section>
    </q-card>
    <q-card class="my-card q-mb-md" v-if="compra != null">
        <q-card-section class="bg-primary text-white">
            <div class=""><i class="la la-shopping-basket"></i> <b>Supermercado:</b> {{compra.supermercado}}</div>
            <div class=""><i class="la la-calendar"></i> <b>Data:</b> {{compra.data_compra}}</div>
        </q-card-section>
    </q-card>

    <list :lista="lista" v-if="!form_compra"></list>
    

    <q-dialog v-model="modal.show" :position="modal.position">
        <q-card style="width: 350px" :class="modal.classe">
            <q-card-section class="text-white text-center">
                {{ modal.texto}}
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import List from 'src/components/List.vue';
import { api } from 'boot/axios';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { List },
    name: 'PageCompras',
    data() {
        return {
            lista: [],
            modal: { 
                show: false,
                position: 'top',
                classe: '',
                texto: ''
            },
            nome_supermercado : null,
            loading: false,
            compra: null,
            form_compra: false
        }
    },
    methods: {
        getLista: function() {
            api.get('api/lista')
            .then((response) => {
                this.lista = response.data
            });
        },
        iniciarCompra: function() {
            this.$refs.formulario.validate()
                .then((sucesso) => {
                    if (sucesso) {
                        this.loading = true;

                        const dados = new FormData()
                        dados.append('supermercado', this.nome_supermercado)

                        api.post('/api/iniciar-compra', dados)
                            .then((response) => {
                                this.loading = false;
                                if (response.status == 200) {
                                    this.modal.show = true;
                                    this.modal.classe = 'bg-positive';
                                    this.modal.texto = response.data.message;
                                    this.form_compra = false;
                                } else {
                                    this.modal.show = true;
                                    this.modal.classe = 'bg-negative';
                                    this.modal.texto = response.data.message;
                                }
                                this.getLista();
                            });

                        setTimeout(() => {
                        this.modal.show = false;
                        }, 2000);
                    }
                });
        },
        verificaCompraEmAberto: function() {
            api.get('api/compra')
            .then((response) => {
                if (response.status == 200) {
                    this.compra = response.data;
                    this.form_compra = false;
                    console.log(response.data);
                    return ;
                }
                this.form_compra = true;
            });
        }
    },
    mounted() {
        this.getLista();
        this.verificaCompraEmAberto();
    }
});
</script>
