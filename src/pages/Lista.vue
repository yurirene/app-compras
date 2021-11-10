<template>
    <div >
        <q-page padding>
            <q-card class="q-mb-md" style="border-radius: 30px">
                <q-expansion-item
                    expand-separator
                    label="Adicionar Item na Lista"
                    icon="la la-cart-plus"
                    class="shadow-1 overflow-hidden"
                    style="border-radius: 30px"
                    header-class="bg-primary text-white"
                    expand-icon-class="text-white"
                >
                    <q-card class="my-card q-mb-md">
                        <q-card-section>
                            <q-form ref="formulario"> 
                                <q-select 
                                    rounded outlined 
                                    v-model="tipo" 
                                    :options="categorias" 
                                    label="Categoria" 
                                    class="q-mb-sm" 
                                    @update:model-value="categoriaSelecionada()"
                                    :rules="[val => !!val || 'Este campo é obrigatório']" 
                                />
                                <q-select 
                                    rounded outlined 
                                    v-model="nome" 
                                    :options="produtos" 
                                    label="Produto" 
                                    class="q-mb-sm"
                                    :rules="[val => !!val || 'Este campo é obrigatório']" 
                                />
                                <q-input 
                                    rounded outlined 
                                    v-model.number="quantidade" 
                                    type="number"
                                    label="Quantidade"  
                                    class="q-mb-sm"
                                    :rules="[val => !!val || 'Este campo é obrigatório']"  
                                />
                            </q-form>
                            <q-btn :loading="loading"  class="full-width" icon-right="send" label="Adicionar" color="primary" @click="adicionarNaLista()"/>
                        </q-card-section>
                    </q-card>
                </q-expansion-item>
            </q-card>
            
            
            <list :lista="lista"  @clickLista="clicou"></list>
            
            <q-dialog v-model="modal.show" :position="modal.position">
                <q-card style="width: 350px" :class="modal.classe">
                    <q-card-section class="text-white text-center">
                        {{ modal.texto}}
                    </q-card-section>
                </q-card>
            </q-dialog>
            <q-dialog v-model="confirm" persistent>
                <q-card style="width: 300px">
                    <q-card-section>
                        <div class="text-h6">Ações</div>
                    </q-card-section>

                    <q-card-actions align="around">
                        <q-btn round color="warning" icon="la la-pen"   @click="form_editar = true"/>
                        <q-btn round color="negative" icon="la la-trash"   @click="form_excluir = true"/>    
                    </q-card-actions>
                    <q-card-actions align="right" v-if="form_excluir">
                        <q-btn flat label="Não" color="primary" v-close-popup @click="this.id_item_selecionado=0" />
                        <q-btn flat label="Confirmar" color="primary" v-close-popup @click="excluir(this.id_item_selecionado)" :loading="loading" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </q-page>
    </div>
</template>
<script>

import { api } from 'boot/axios'
import List from 'src/components/List.vue';


export default {
  components: { List },
    data() {
        return {
            nome: null,
            tipo: null,
            quantidade: null,
            categorias: [],
            produtos: [],
            loading: false,
            modal: { 
                show: false,
                position: 'top',
                classe: '',
                texto: ''
            },
            lista: [],
            confirm: false,
            id_item_selecionado: 0,
            form_editar: false,
            form_excluir: false
        }
    },
    methods: {
        adicionarNaLista: function () {
            this.loading = true;
            this.$refs.formulario.validate()
            .then((sucesso) => {
                if (sucesso) {
                    const dados = new FormData()
                    dados.append('produto_id', this.nome.value)
                    dados.append('quantidade', this.quantidade)

                    api.post('/api/add-item-lista', dados)
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
                        });

                    setTimeout(() => {
                       this.modal.show = false;
                    }, 2000);
                }
            })
        },
        categoriaSelecionada: function () {
            api.get('api/produtos/' + this.tipo.value)
            .then((response) => {
                this.produtos = response.data;
            })
        },
        getLista: function() {
            api.get('api/lista')
            .then((response) => {
                this.lista = response.data
            });
        },
        clicou: function(value) {
            this.id_item_selecionado = value;
            this.confirm = true;
        },
        excluir: function(value) {
            this.loading = true;
            const dados = new FormData();
            dados.append('produto_id', value)
            api.post('/api/excluir-produto-lista', dados)
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
                });

            setTimeout(() => {
                this.modal.show = false;
            }, 2000);
        }
    },
    mounted() {
        api.get('api/categorias')
        .then((response) => {
            this.categorias = response.data
        });

        this.getLista();
    }
}
</script>