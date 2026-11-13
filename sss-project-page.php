<?php
/**
 * Plugin Name: SSS Project Page 2026
 * Description: Сторінка проєкту соціального захисту. Шорткод: [sss_project_2026].
 * Version: 1.7.3
 * Requires at least: 6.3
 * Requires PHP: 7.4
 * Author: SSS
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function sss_project_2026_assets() {
    $url = plugin_dir_url( __FILE__ );
    wp_enqueue_style( 'sss-project-2026', $url . 'style.css', array(), '1.7.3' );
    wp_enqueue_script( 'sss-project-2026', $url . 'main.js', array(), '1.7.3', true );
}
function sss_project_2026_maybe_enqueue() {
    if ( is_singular() ) {
        $post = get_post();
        if ( $post && has_shortcode( $post->post_content, 'sss_project_2026' ) ) {
            sss_project_2026_assets();
        }
    }
}
add_action( 'wp_enqueue_scripts', 'sss_project_2026_maybe_enqueue' );

/** Render bundled trusted markup, without user HTML or external requests. */
function sss_project_2026_render( $attributes = array() ) {
    static $rendered = false;
    if ( $rendered ) { return ''; }
    $rendered = true;
    sss_project_2026_assets();
    $attributes = shortcode_atts( array( 'chrome' => 'theme' ), $attributes, 'sss_project_2026' );
    $file = __DIR__ . '/page-content.html';
    if ( ! is_readable( $file ) ) { return ''; }
    $html = file_get_contents( $file );
    if ( false === $html ) { return ''; }
    $html = str_replace( 'src="assets/', 'src="' . esc_url( plugin_dir_url( __FILE__ ) . 'assets/' ), $html );
    if ( 'own' !== $attributes['chrome'] ) {
        $html = str_replace( 'class="sss-project"', 'class="sss-project sss-project--embedded"', $html );
        $html = preg_replace( '/<header class="site-header">[\s\S]*?<\/header>/', '', $html );
        $html = preg_replace( '/<footer class="site-footer">[\s\S]*?<\/footer>/', '', $html );
        $html = str_replace( array( '<main id="project-main">', '</main>' ), array( '<div id="project-main">', '</div>' ), $html );
    }
    return $html;
}
add_shortcode( 'sss_project_2026', 'sss_project_2026_render' );
