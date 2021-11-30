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
            
            
            <list :lista="lista"  @clickEditar="clicouEditar" @clickApagar="clicouApagar" @clickComprar="clicouComprar"  :compras="false"></list>
            
            <q-dialog v-model="modal.show" :position="modal.position">
                <q-card style="width: 350px" :class="modal.classe">
                    <q-card-section class="text-white text-center">
                        {{ modal.texto}}
                    </q-card-section>
                </q-card>
            </q-dialog>


            <q-dialog v-model="editar_item" persistent ref="modal_edicao">
                <q-card style="width: 300px">
                    <q-card-section>
                        <div class="text-h6">Editar Item da Lista</div>
                    </q-card-section>
                    <q-card-section>
                        <q-form ref="formulario_edicao">
                            <q-input 
                                rounded outlined 
                                v-model.number="quantidade_edicao" 
                                type="number"
                                label="Quantidade"  
                                class="q-mb-sm"
                                :rules="[val => !!val || 'Este campo é obrigatório']"  
                            />
                        </q-form>
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn flat label="Não" color="primary" v-close-popup />
                        <q-btn flat label="Confirmar" color="primary"  @click="editar" :loading="loading" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <q-dialog v-model="apagar_item" persistent>
                <q-card style="width: 300px">
                    <q-card-section>
                        <div class="text-h6">Excluir Item da Lista</div>
                    </q-card-section>

                    <q-card-section>
                        <div class="text-h6">Você confirma essa operação?</div>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat label="Não" color="primary" v-close-popup @click="this.id_item_selecionado=0" />
                        <q-btn flat label="Confirmar" color="primary" v-close-popup @click="excluir()" :loading="loading" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <q-dialog v-model="comprar_item" persistent ref="modal_comprar">
                <q-card style="width: 300px">
                    <q-card-section>
                        <div class="text-h6">Comprar Item da Lista</div>
                    </q-card-section>
                    <q-card-section>
                        <q-form ref="formulario_comprar">
                            <q-input 
                                rounded outlined 
                                v-model.number="quantidade_item_selecionado" 
                                type="number"
                                label="Quantidade"  
                                class="q-mb-sm"
                                :rules="[val => !!val || 'Este campo é obrigatório']"  
                            />
                            <q-input 
                                rounded outlined 
                                v-model.number="valor_item" 
                                type="number"
                                label="Valor"  
                                class="q-mb-sm"
                                :rules="[val => !!val || 'Este campo é obrigatório']"  
                            />
                        </q-form>
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn flat label="Não" color="primary" v-close-popup />
                        <q-btn flat label="Confirmar" color="primary"  @click="comprar" :loading="loading" />
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
            editar_item: false,
            apagar_item: false,
            comprar_item: false,
            quantidade_edicao: 0,
            quantidade_item_selecionado: 0,
            valor_item: 0
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
        clicouEditar: function(value) {
            this.id_item_selecionado = value.id;
            this.quantidade_edicao = value.quantidade;
            this.editar_item = true;
        },
        
        clicouApagar: function(value) {
            this.id_item_selecionado = value;
            this.apagar_item = true;
        },

        clicouComprar: function(value) {
            this.id_item_selecionado = value.id;
            this.quantidade_item_selecionado = value.quantidade;
            this.comprar_item = true;
        },

        editar: function() {

            this.loading = true;
            
            this.$refs.formulario_edicao.validate();
            
            const dados = new FormData();
            dados.append('produto_id', this.id_item_selecionado)
            dados.append('quantidade', this.quantidade_edicao)

            api.post('/api/edit-item-lista', dados)
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

            this.$refs.modal_edicao.hide();

            setTimeout(() => {
                this.modal.show = false;
            }, 2000);

        },
        excluir: function() {
            this.loading = true;
            const dados = new FormData();
            dados.append('produto_id', this.id_item_selecionado)
            api.post('/api/delete-item-lista', dados)
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
        },
        comprar: function() {
            this.loading = true;
            const dados = new FormData();
            dados.append('produto_id', this.id_item_selecionado);
            dados.append('quantidade', this.quantidade_item_selecionado);
            dados.append('valor', this.valor_item);

            api.post('/api/comprar-item', dados)
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

            this.$refs.modal_comprar.hide();

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