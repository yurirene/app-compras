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
            <div class=""><i class="la la-dollar"></i> <b>Valor Total:</b> {{compra.valor_total}}</div>
        </q-card-section>

        <q-card-section class="bg-primary text-white"  align="right">
            <q-btn outline rounded color="white" label="Finalizar" />
        </q-card-section>
    </q-card>

    <list :lista="lista" v-if="!form_compra" :compras="true"  @clickApagar="clicouApagar" ></list>
    

    <q-dialog v-model="modal.show" :position="modal.position">
        <q-card style="width: 350px" :class="modal.classe">
            <q-card-section class="text-white text-center">
                {{ modal.texto}}
            </q-card-section>
        </q-card>
    </q-dialog>
    <q-dialog v-model="apagar_item" persistent>
        <q-card style="width: 300px">
            <q-card-section>
                <div class="text-h6">Excluir Item da Lista de Comprados</div>
            </q-card-section>

            <q-card-section>
                <div class="text-h6">Você confirma essa operação?</div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Não" color="primary" v-close-popup @click="this.id_item_selecionado=0" />
                <q-btn flat label="Confirmar" color="primary" v-close-popup @click="excluir" :loading="loading" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>

import { api } from 'boot/axios';
import List from 'src/components/List.vue';

export default {
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
            form_compra: false,
            apagar_item: false,
            id_item_selecionado: 0,
        }
    },
    methods: {
         clicouApagar: function(value) {
            this.id_item_selecionado = value;
            this.apagar_item = true;
        },
        excluir: function() {
            this.loading = true;
            const dados = new FormData();
            dados.append('produto_id', this.id_item_selecionado)
            api.post('/api/delete-item-lista-compra', dados)
                .then((response) => {
                    this.loading = false;
                    if (response.status == 200) {
                        this.modal.show = true;
                        this.modal.classe = 'bg-positive';
                        this.modal.texto = response.data.message;
                    } else {
                        this.modal.show = true;
                        this.modal.classe = 'bg-negative';
                        this.modal.texto = response.data.message;
                    }
                    this.getLista();
                    this.verificaCompraEmAberto();
                });

            setTimeout(() => {
                this.modal.show = false;
            }, 2000);
        },
        getLista: function() {
            if (this.compra == null) {
                return ;
            }
            const dados = {
                compra_id : this.compra.id
            };
            api.post('/api/lista-compra', dados)
            .then((response) => {
                if (response.status != 200) {
                    return ;
                }
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
        async verificaCompraEmAberto() {

            api.get('api/compra')
            .then((response) => {
                if (response.status == 200) {
                    this.compra = response.data;
                    this.form_compra = false;
                    this.getLista();
                } else {
                    this.form_compra = true;
                }
            });
        }
    },
    mounted() {
        this.verificaCompraEmAberto();
    }
};
</script>
